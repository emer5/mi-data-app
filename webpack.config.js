// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development', // Cambia a 'production' para versión final
  entry: './src/index.tsx',
  module: {
    rules: [
      { // Regla para TypeScript (existente)
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { // --- NUEVA REGLA PARA CSS ---
        test: /\.css$/i, // Busca archivos que terminen en .css (case-insensitive)
        use: ['style-loader', 'css-loader'], // Usa estos loaders
                                            // css-loader: lee el archivo CSS
                                            // style-loader: inyecta el CSS en el <head> del HTML
        // -----------------------------
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Mantiene las extensiones resolubles
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};