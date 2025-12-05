// functions/index.js - Pages Function for homepage redirect
export async function onRequest(context) {
  const { request, next } = context;
  
  // Only handle root path
  const url = new URL(request.url);
  if (url.pathname !== '/' && url.pathname !== '') {
    return next(); // Let Pages serve the file normally
  }
  
  // Get current date in Pacific Time
  const pacificTime = new Date(new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
  }));
  
  const year = pacificTime.getFullYear();
  const month = String(pacificTime.getMonth() + 1).padStart(2, '0');
  const day = String(pacificTime.getDate()).padStart(2, '0');
  
  // Try up to 7 days back to find an existing folder
  for (let daysBack = 0; daysBack < 7; daysBack++) {
    const checkDate = new Date(pacificTime);
    checkDate.setDate(checkDate.getDate() - daysBack);
    
    const checkYear = checkDate.getFullYear();
    const checkMonth = String(checkDate.getMonth() + 1).padStart(2, '0');
    const checkDay = String(checkDate.getDate()).padStart(2, '0');
    
    // Construct the folder path
    const folderPath = `/${checkYear}/${checkMonth}/${checkYear}-${checkMonth}-${checkDay}`;
    const indexPath = `${folderPath}/index.html`;
    const checkUrl = new URL(indexPath, request.url).toString();
    
    // Check if index.html exists
    try {
      const checkResponse = await fetch(checkUrl, { method: 'HEAD' });
      
      // If index.html exists, redirect to the folder
      if (checkResponse.ok) {
        return Response.redirect(new URL(folderPath, request.url).toString(), 302);
      }
    } catch (error) {
      // Continue to next day if there's an error
      continue;
    }
  }
  
  // If no folder found in the last 7 days, return error message
  return new Response(
    `No daily folder found for the past 7 days. Expected format: ${year}/${month}/${year}-${month}-${day}`,
    {
      status: 404,
      headers: { 'content-type': 'text/plain' }
    }
  );
}