export default {
  async fetch(request, env, ctx) {
    // Enable test mode by adding ?test=true to URL
    const url = new URL(request.url);
    const testMode = url.searchParams.get('test') === 'true';
    
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
      
      // In development, check against local static server
      // In production, check against the same origin
      const isDev = request.url.includes('localhost:8787');
      const baseUrl = isDev ? 'http://localhost:3000' : new URL(request.url).origin;
      const checkUrl = new URL(indexPath, baseUrl).toString();
      const redirectUrl = new URL(folderPath, request.url).toString();
      
      // In test mode, show what would be checked instead of actually checking
      if (testMode) {
        return new Response(
          `Test Mode:\n\n` +
          `Pacific Time: ${pacificTime.toLocaleString()}\n` +
          `Checking (day ${daysBack}): ${indexPath}\n` +
          `Check URL: ${checkUrl}\n` +
          `Redirect URL: ${redirectUrl}\n\n` +
          `To actually test redirect, remove ?test=true from URL`,
          {
            headers: { 'content-type': 'text/plain' }
          }
        );
      }
      
      // Check if index.html exists by making a HEAD request
      try {
        const checkResponse = await fetch(checkUrl, { method: 'HEAD' });
        
        // If index.html exists (200 or 301/302), redirect to the folder
        if (checkResponse.ok || checkResponse.status === 301 || checkResponse.status === 302) {
          return Response.redirect(redirectUrl, 302);
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
  },
};