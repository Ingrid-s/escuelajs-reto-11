const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const ApiKeyService = require('../services/apiKeys');
const UsersServices = require('../services/users');

const { config } = require('../config/index');


require('../utils/auth/strategies/basic');

function authApi(app) {
  const router = express.Router();
  app.use('/api/auth', router);

  const apiKeyService = new ApiKeyService();
  const userServices = new UsersServices();


  // Sign-In
  router.post('/sign-in', async (req, res, next) => {
    const { apiKeyToken } = req.body;

    if(!apiKeyToken) {
      next(new Error('apiKeyToken is required'), null);
    }

    passport.authenticate('basic', (error, user) => {
      try {
        if(error || !user) {
          next(error, false);
        }
        
        req.login(user, { session: false }, async function(error){ 
          if(error) {
            next(error);
          }

          const apiKey = await apiKeyService.getApiKey({ token: apiKeyToken });

          const {
            _id: id,
            name,
            email
          } = user;

          const payload = {
            sub: id,
            name,
            email,
            scopes: apiKey.scopes
          }

          const token = jwt.sign(payload, config.authJwtSecret, { expiresIn: '15m'});

          return res.status(200).json({
            token,
            user: {
              id, 
              name,
              email
            }
          });
        })
      } catch(error) {
        next(error);
      }
    })(req, res, next);
  });


  // Sign-up
  router.post('/sign-up', async (req, res, next) => {
    const { body: user } = req;
    
    try {
      const createUserId = await userServices.createUser({ user });

      res.status(201).json({
        data: createUserId,
        message: 'user created'
      });
    } catch(error) {
      next(error);
    }
  });
}

module.exports = authApi;