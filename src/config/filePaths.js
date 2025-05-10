export const FILE_PATHS = {
  development: {
    uploads: 'public/uploads',
    models: 'public/models',
    images: 'public/uploads/images',
    pdfs: 'public/uploads/pdfs'
  },
  production: {
    uploads: '.next/static/uploads',
    models: '.next/static/models',
    images: '.next/static/uploads/images',
    pdfs: '.next/static/uploads/pdfs'
  }
};

export const getFilePath = (type, isDevelopment) => {
  const paths = isDevelopment ? FILE_PATHS.development : FILE_PATHS.production;
  return paths[type];
};
