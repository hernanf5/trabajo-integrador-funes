import express from 'express';
import cors from 'cors';
import fs from 'fs';
import translate from 'node-google-translate-skidz';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.post("/translate", async (req, res) => {
  try{
    const { text } = req.body;
    const result = await translate({text:text, source:"en", target:"es"});
    res.json({ result });
  } catch (error){
    console.log("error de traduccion", error);
    res.status(500).json({error: error.stack});
  }
})

app.get("/products", async (req, res) => {
  try{
    const response = await fetch('https://fakestoreapi.com/products');
    const data = await response.json();
    res.json({data});
  }catch(error){
    console.log("error al obtener los productos", error);
    res.status(500).json({error: "error al obtener los productos"});
  }
})

app.get("/discounts", async (req, res) => {
  try {
    fs.readFile('discounts.json', 'utf8', (err, data) => {
      if (err) {
        console.error("error al obtener los descuentos", err);
        res.status(500).json({ error: "error al obtener los descuentos" });
        return;
      }
      res.json(JSON.parse(data));
    });
  } catch (error) {
    console.error("error al obtener los descuentos", error);
    res.status(500).json({ error: "error al obtener los descuentos" });
  }
});

app.post("/comprar", async (req, res) => {
  const datosLocalStorage = req.body.data;
  if(datosLocalStorage){
    const datosJSON = JSON.stringify(datosLocalStorage, null, 2);
    
    // Leer el contenido actual del archivo compras.json, si existe
    let comprasExistente = [];
    try {
      const contenidoExistente = fs.readFileSync('compras.json', 'utf8');
      comprasExistente = JSON.parse(contenidoExistente);
    } catch (error) {
      console.error("Error al leer el archivo compras.json:", error);
    }
    comprasExistente.push(datosLocalStorage);
    fs.writeFile('compras.json', JSON.stringify(comprasExistente, null, 2), (err) => {
      if (err) {
        console.error("Error al registrar la compra", err);
        res.status(500).json({ error: "Error al registrar la compra" });
        return;
      } else {
        res.status(200).json({ message: "La compra ha sido registrada con éxito" });
      }
    });
  } else {
    res.status(400).json({ error: "No se proporcionaron datos para guardar" });
  }
});




app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(3000 ,()=>console.log('Server listening on port 3000'))