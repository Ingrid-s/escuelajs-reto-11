const express = require('express');
const path = require('path');
const ProductService = require('../services');
const receipt = '../assets/receipt.pdf'

const platziStore = (app) => {
  const router = express.Router();
  app.use('/api/', router);

  const productService = new ProductService();

  router.get('/', (req, res) => {
    res.send(`API v2`);
  });

  router.get('/receipts', (req, res, next) => {
    let file = path.join(__dirname, receipt);
    res.sendFile(file);
  });

  router.get('/products', async (req, res, next) => {
    const storeProducts = await productService.getProducts()
    res.status(200).json(storeProducts);
  });

  router.get('/products/:id', async (req, res, next) => {
    const { id } = req.params
    const storeProducts = await productService.getProductById(id)
    res.status(200).json(storeProducts);
  });
  
  router.post("/products", async (req, res, next) => {
    const { body: product } = req;
    const createProductId = await productService.createProduct({ product });
    res.status(200).json(createProductId);
  });

  router.put(
    "/products/:id",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:products']),
    async (req, res, next) => {
      const { id } = req.params;
      const { body: product } = req;
      // const { product } = req.body
      // const product = req.body.product

      const storeProducts = await productService.updateProductById({
        id,
        ...product
      });
      res.status(200).json(storeProducts);
    }
  );


  router.delete(
    "/products/:id",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:products']),
    async (req, res, next) => {
      const { id } = req.params;
          
      const storeProducts = await productService.deleteProductById(id);
      res.status(200).json(storeProducts);
    }
  );

  router.get('*', (req, res) => {
    res.status(404).send('Error 404');
  });
}

module.exports = platziStore;