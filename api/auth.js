const express = require('express');
const router = express.Router();
const { supabase } = require('../config');

// Rota para registro de usuário
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Dados incompletos' });
  }
  
  try {
    // Registrar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (authError) throw authError;
    
    // Criar perfil do usuário no banco de dados
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) throw profileError;
    
    res.json({ 
      success: true, 
      message: 'Usuário registrado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ success: false, message: error.message || 'Erro ao registrar usuário' });
  }
});

// Rota para login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
  }
  
  try {
    // Autenticar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Obter perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') throw profileError;
    
    res.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profileData?.name || data.user.user_metadata?.name || ''
      },
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(401).json({ success: false, message: error.message || 'Credenciais inválidas' });
  }
});

// Rota para logout
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
  
  try {
    // Invalidar sessão no Supabase Auth
    const { error } = await supabase.auth.signOut({
      scope: 'local'
    });
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({ success: false, message: error.message || 'Erro ao fazer logout' });
  }
});

// Rota para verificar token
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
  
  try {
    // Verificar token no Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    
    // Obter perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') throw profileError;
    
    res.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profileData?.name || data.user.user_metadata?.name || ''
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ success: false, message: error.message || 'Erro ao verificar token' });
  }
});

// Rota para atualizar perfil
router.put('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { name } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
  
  try {
    // Verificar token no Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    if (name) updates.name = name;
    
    // Atualizar perfil no banco de dados
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userData.user.id);
    
    if (updateError) throw updateError;
    
    // Atualizar metadados do usuário no Auth
    if (name) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name }
      });
      
      if (metadataError) throw metadataError;
    }
    
    res.json({ success: true, message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ success: false, message: error.message || 'Erro ao atualizar perfil' });
  }
});

module.exports = router;