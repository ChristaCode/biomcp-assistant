import dotenv from 'dotenv';
import { queryBioMCP, queryPubMedDirect } from '../lib/biomcp.js';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'ANTHROPIC_API_KEY is not configured. Please set it in your .env file.' 
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request: messages array is required and must not be empty'
      });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : JSON.stringify(lastMessage.content);

    const biomedicalKeywords = [
      'paper', 'papers', 'study', 'studies', 'trial', 'trials', 'pubmed', 
      'clinical', 'gene', 'variant', 'disease', 'drug', 'treatment', 
      'biomedical', 'research', 'publication', 'article'
    ];
    const isBiomedicalQuery = biomedicalKeywords.some(keyword => 
      userQuery.toLowerCase().includes(keyword)
    );

    let formattedMessages = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return {
          role: msg.role,
          content: msg.content
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });

    let biomcpData = null;
    let dataSource = null;
    if (isBiomedicalQuery && lastMessage.role === 'user') {
      try {
        const biomcpPromise = queryBioMCP(userQuery);
        const biomcpTimeout = new Promise((resolve) => 
          setTimeout(() => resolve(null), 5000)
        );
        
        biomcpData = await Promise.race([biomcpPromise, biomcpTimeout]);
        
        if (biomcpData && !biomcpData._error) {
          if (!biomcpData.source) {
            biomcpData.source = 'BioMCP Server';
          }
          dataSource = 'BioMCP';
        }
        
        if (!biomcpData || biomcpData._error) {
          const pubmedPromise = queryPubMedDirect(userQuery, 10);
          const pubmedTimeout = new Promise((resolve) =>
            setTimeout(() => resolve(null), 10000)
          );
          biomcpData = await Promise.race([pubmedPromise, pubmedTimeout]);
          
          if (biomcpData && !biomcpData._error) {
            dataSource = 'PubMed Direct API';
          }
        }
        
        if (biomcpData && biomcpData._error) {
          biomcpData = null;
          dataSource = null;
        }
      } catch (error) {
        console.error('Biomedical query failed, proceeding without it:', error.message);
        biomcpData = null;
        dataSource = null;
      }
    }

    if (biomcpData && !biomcpData._error) {
      const sourceLabel = dataSource === 'BioMCP' 
        ? 'BioMCP Server (PubMed, ClinicalTrials.gov, MyVariant.info)'
        : dataSource === 'PubMed Direct API'
        ? 'PubMed Direct API (NCBI E-utilities)'
        : 'biomedical databases';
      
      const biomcpContext = {
        role: 'user',
        content: `Here is data from ${sourceLabel} related to your query:\n\n${JSON.stringify(biomcpData, null, 2)}\n\nPlease use this information to answer the user's question: ${userQuery}. When presenting the results, please indicate that the data came from ${dataSource || 'biomedical databases'}.`
      };
      formattedMessages = [
        ...formattedMessages.slice(0, -1),
        biomcpContext,
        formattedMessages[formattedMessages.length - 1]
      ];
    }

    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: formattedMessages
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      
      if (response.status === 529) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const retryResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return res.json(retryData);
        } else {
          const retryErrorText = await retryResponse.text();
          console.error('Anthropic API retry error:', retryResponse.status, retryErrorText);
          return res.status(retryResponse.status).json({ 
            error: `API request failed: ${retryResponse.status}`,
            details: retryErrorText
          });
        }
      }
      
      return res.status(response.status).json({ 
        error: `API request failed: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

