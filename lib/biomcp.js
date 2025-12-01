const queryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;

function normalizeQuery(query) {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getCacheKey(query, maxResults) {
  return `pubmed:${normalizeQuery(query)}:${maxResults}`;
}

function getCachedResult(key) {
  const cached = queryCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    queryCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedResult(key, data) {
  queryCache.set(key, {
    data: data,
    timestamp: Date.now()
  });
}

export async function queryBioMCP(query) {
  try {
    const baseUrl = 'https://biomcp-server-452652483423.europe-west4.run.app';

    const controller = new AbortController();
    const sseTimeout = setTimeout(() => controller.abort(), 5000);
    
    let sessionId = null;
    try {
      const sseResponse = await fetch(`${baseUrl}/sse`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream'
        },
        signal: controller.signal
      });

      if (!sseResponse.ok) {
        console.error('BioMCP SSE connection failed:', sseResponse.status);
        return null;
      }

      const sseReader = sseResponse.body.getReader();
      const sseDecoder = new TextDecoder();
      let sseBuffer = '';

      try {
        for (let i = 0; i < 10; i++) {
          const { done, value } = await Promise.race([
            sseReader.read(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Read timeout')), 3000))
          ]);
          
          if (done) break;
          
          const chunk = sseDecoder.decode(value, { stream: true });
          sseBuffer += chunk;
          
          const lines = sseBuffer.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const eventData = trimmed.substring(6).trim();
              const match = eventData.match(/session_id=([^\s\n"']+)/);
              if (match) {
                sessionId = match[1];
                break;
              }
            }
          }
          
          if (sessionId) break;
        }
      } finally {
        sseReader.releaseLock();
      }

      clearTimeout(sseTimeout);

      if (!sessionId) {
        console.error('Could not parse BioMCP session ID');
        return null;
      }
    } catch (e) {
      console.error('Error getting session ID:', e.message);
      return null;
    }
    
    let resultsSSEReader = null;
    let resultsSSEDecoder = null;
    
    try {
      const resultsSSEResponse = await fetch(`${baseUrl}/sse?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream'
        }
      });
      
      if (!resultsSSEResponse.ok) {
        console.error('Failed to establish results SSE connection:', resultsSSEResponse.status);
        return null;
      }
      
      resultsSSEReader = resultsSSEResponse.body.getReader();
      resultsSSEDecoder = new TextDecoder();
      
    } catch (e) {
      console.error('Error establishing results SSE connection:', e.message);
      return null;
    }
    
    const sessionEndpoint = `/messages/?session_id=${sessionId}`;
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'pubmed_search',
        arguments: {
          query: query,
          max_results: 10
        }
      }
    };
    
    let postAccepted = false;
    try {
      const postResponse = await fetch(`${baseUrl}${sessionEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (postResponse.status === 202) {
        postAccepted = true;
      } else {
        const errorText = await postResponse.text();
        console.error(`BioMCP POST failed: ${postResponse.status}`, errorText);
        return null;
      }
    } catch (e) {
      console.error('BioMCP POST request error:', e.message);
      return null;
    }
    
    if (!postAccepted) {
      if (resultsSSEReader) {
        resultsSSEReader.releaseLock();
      }
      return null;
    }
    
    let sseResultData = null;
    
    if (!resultsSSEReader) {
      console.error('SSE connection not established');
      return null;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let resultsBuffer = '';
      let currentEventType = null;
      let timeoutReached = false;
      const timeoutInterval = setInterval(() => {
        timeoutReached = true;
      }, 120000);
      
      while (!timeoutReached && !sseResultData) {
        let readResult;
        try {
          readResult = await resultsSSEReader.read();
        } catch (readError) {
          console.error('SSE read error:', readError.message);
          break;
        }
        
        const { done, value } = readResult;
        
        if (done) break;
        
        if (value) {
          const sseChunk = resultsSSEDecoder.decode(value, { stream: true });
          resultsBuffer += sseChunk;
          
          const sseLines = resultsBuffer.split('\n');
          resultsBuffer = sseLines.pop() || '';
          
          for (const line of sseLines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('event: ')) {
              currentEventType = trimmed.substring(7).trim();
            } else if (trimmed.startsWith('data: ')) {
              const eventData = trimmed.substring(6).trim();
              
              if (eventData.includes('/messages/?session_id=') || eventData === 'Accepted') {
                currentEventType = null;
                continue;
              }
              
              if (eventData.length > 5) {
                try {
                  const parsed = JSON.parse(eventData);
                  
                  if (parsed.error) {
                    sseResultData = { _error: true, error: parsed.error };
                    clearInterval(timeoutInterval);
                    break;
                  }
                  
                  if (parsed.result) {
                    sseResultData = parsed.result;
                    clearInterval(timeoutInterval);
                    break;
                  } else if (parsed && (parsed.results || parsed.data || parsed.papers || parsed.trials || parsed.variants)) {
                    sseResultData = parsed;
                    clearInterval(timeoutInterval);
                    break;
                  } else if (currentEventType && (currentEventType === 'result' || currentEventType === 'data' || currentEventType === 'complete' || currentEventType === 'message')) {
                    sseResultData = parsed;
                    clearInterval(timeoutInterval);
                    break;
                  }
                } catch (e) {
                  // Skip non-JSON data
                }
              }
              
              currentEventType = null;
            }
          }
          
          if (sseResultData && !sseResultData._error) {
            clearInterval(timeoutInterval);
            break;
          }
        }
      }
      
      clearInterval(timeoutInterval);
      
      if (resultsSSEReader) {
        resultsSSEReader.releaseLock();
      }
      
      if (sseResultData && !sseResultData._error) {
        if (!sseResultData.source) {
          sseResultData.source = 'BioMCP Server';
        }
        return sseResultData;
      } else if (sseResultData && sseResultData._error) {
        return null;
      } else {
        return null;
      }
    } catch (e) {
      console.error('SSE read error:', e.message);
      if (resultsSSEReader) {
        resultsSSEReader.releaseLock();
      }
      return null;
    }
  } catch (e) {
    console.error('BioMCP query error:', e.message);
    return null;
  }
}

export async function queryPubMedDirect(query, maxResults = 10) {
  const cacheKey = getCacheKey(query, maxResults);
  
  try {
    const cached = getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }
    
    const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    searchUrl.searchParams.set('db', 'pubmed');
    searchUrl.searchParams.set('term', query);
    searchUrl.searchParams.set('retmax', maxResults.toString());
    searchUrl.searchParams.set('retmode', 'json');
    searchUrl.searchParams.set('sort', 'relevance');
    
    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      console.error('PubMed search failed:', searchResponse.status);
      return null;
    }
    
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];
    
    if (pmids.length === 0) {
      return { papers: [], count: 0, source: 'PubMed Direct API' };
    }
    
    const summaryUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
    summaryUrl.searchParams.set('db', 'pubmed');
    summaryUrl.searchParams.set('id', pmids.join(','));
    summaryUrl.searchParams.set('retmode', 'json');
    
    const summaryResponse = await fetch(summaryUrl.toString());
    
    if (!summaryResponse.ok) {
      console.error('PubMed summary fetch failed:', summaryResponse.status);
      return null;
    }
    
    const summaryData = await summaryResponse.json();
    const papers = [];
    
    for (const pmid of pmids) {
      const article = summaryData.result?.[pmid];
      if (!article) continue;
      
      const authors = article.authors?.slice(0, 3).map(a => a.name).join(', ') || 'Unknown authors';
      const hasMoreAuthors = article.authors && article.authors.length > 3;
      
      papers.push({
        pmid: pmid,
        title: article.title || 'No title available',
        authors: hasMoreAuthors ? `${authors} et al.` : authors,
        journal: article.fulljournalname || article.source || 'Unknown journal',
        pubdate: article.pubdate || 'Unknown date',
        doi: article.elocationid || null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: 'PubMed'
      });
    }
    
    const result = {
      papers: papers,
      count: papers.length,
      total_found: parseInt(searchData.esearchresult?.count) || 0,
      source: 'PubMed Direct API (NCBI E-utilities)'
    };
    
    setCachedResult(cacheKey, result);
    
    return result;
    
  } catch (error) {
    console.error('PubMed direct query error:', error.message);
    return null;
  }
}

