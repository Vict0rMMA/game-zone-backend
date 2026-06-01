import 'dotenv/config';
import app from './app';

// En Vercel se exporta el app; en local se levanta el servidor
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
