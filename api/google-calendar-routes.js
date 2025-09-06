const express = require('express');
const router = express.Router();
const { createAuthUrl, getTokenFromCode, getEvents, createEvent } = require('./google-calendar-integration');
const { supabase } = require('../config');

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

// Rota para obter a URL de autorização do Google
router.get('/auth-url', async (req, res) => {
  try {
    const authUrl = await createAuthUrl();
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de autorização:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar URL de autorização' });
  }
});

// Rota para processar o código de autorização (requer autenticação)
router.post('/process-code', authenticateUser, async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Código não fornecido' });
  }

  try {
    const tokenData = await getTokenFromCode(code);
    
    // Salvar tokens no Supabase
    const { error } = await supabase
      .from('google_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar tokens:', error);
      return res.status(500).json({ success: false, message: 'Erro ao salvar tokens' });
    }

    res.json({ success: true, message: 'Autenticação com Google Calendar concluída com sucesso' });
  } catch (error) {
    console.error('Erro ao processar código de autorização:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar código de autorização' });
  }
});

// Rota pública para processar o código de autorização (sem autenticação)
router.post('/process-code-public', async (req, res) => {
  const { code, state } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Código não fornecido' });
  }

  try {
    const tokenData = await getTokenFromCode(code);
    
    // Em produção, você deve verificar o estado e associar o token ao usuário correto
    // Por enquanto, apenas retornamos sucesso
    
    res.json({ 
      success: true, 
      message: 'Autenticação com Google Calendar concluída com sucesso',
      // Não retorne tokens em produção, isso é apenas para teste
      tokenInfo: {
        access_token: tokenData.access_token.substring(0, 10) + '...',
        expires_in: tokenData.expires_in,
        has_refresh_token: !!tokenData.refresh_token
      }
    });
  } catch (error) {
    console.error('Erro ao processar código de autorização:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar código de autorização' });
  }
});

// Rota para obter eventos (requer autenticação)
router.get('/events', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Obter tokens do usuário do Supabase
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado com Google Calendar' });
    }

    const events = await getEvents(tokenData.access_token, tokenData.refresh_token);
    res.json({ success: true, events });
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter eventos' });
  }
});

// Rota para criar evento (requer autenticação)
router.post('/events', authenticateUser, async (req, res) => {
  const { summary, description, start, end, attendees } = req.body;
  const userId = req.user.id;
  
  if (!summary || !start || !end) {
    return res.status(400).json({ success: false, message: 'Dados incompletos para criar evento' });
  }

  try {
    // Obter tokens do usuário do Supabase
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado com Google Calendar' });
    }

    const eventData = {
      summary,
      description,
      start: { dateTime: start },
      end: { dateTime: end },
      attendees: attendees?.map(email => ({ email })) || []
    };

    const createdEvent = await createEvent(tokenData.access_token, tokenData.refresh_token, eventData);
    res.json({ success: true, event: createdEvent });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar evento' });
  }
});

module.exports = router;