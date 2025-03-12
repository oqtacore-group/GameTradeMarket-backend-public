export * from './value-of';


export function getFileExtFromUrl(url) {
    // Parse the URL
    let parsedUrl = new URL(url);
  
    // Get the path
    let path = parsedUrl.pathname;
  
    // Split the path into components
    let pathComponents = path.split('/');
  
    // Get the last component, which should be the file name
    let fileNameWithExt = pathComponents[pathComponents.length - 1];
  
    // Remove the extension
    let fileExt = fileNameWithExt.split('.')[1];
  
    return fileExt;
}