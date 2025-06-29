import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { tweet, providerToken } = await req.json();

    console.log("Twitter API request:", {
      tweetLength: tweet?.length,
      hasToken: !!providerToken,
      tokenPrefix: providerToken?.substring(0, 10) + "...",
    });

    if (!tweet || !providerToken) {
      return new Response(
        JSON.stringify({ error: "Missing tweet content or provider token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate token format (Twitter tokens should start with specific patterns)
    if (!providerToken.match(/^[A-Za-z0-9_-]+$/)) {
      console.error("Invalid token format:", providerToken.substring(0, 20));
      return new Response(
        JSON.stringify({
          error:
            "Invalid token format. Please log out and log back in with Twitter.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // First, verify the token by checking user info
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "User-Agent": "ElectricalInfrastructureApp/1.0",
      },
    });

    if (!userResponse.ok) {
      const userError = await userResponse.json();
      console.error("Twitter user verification failed:", userError);
      throw new Error(
        `Twitter authentication failed: ${userError.detail || userError.title || "Invalid token"}. Please log out and log back in with Twitter.`,
      );
    }

    const userData = await userResponse.json();
    console.log("Twitter user verified:", userData.data?.username);

    // Make the Twitter API call with OAuth 2.0 User Context
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
        "User-Agent": "ElectricalInfrastructureApp/1.0",
      },
      body: JSON.stringify({
        text: tweet,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitter API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorData,
      });

      // Check if it's an authentication error
      if (response.status === 401) {
        throw new Error(
          `Twitter authentication failed. The access token may be expired or invalid. Please log out and log back in with Twitter.`,
        );
      }

      throw new Error(
        `Twitter API error (${response.status}): ${errorData.detail || errorData.title || response.statusText}`,
      );
    }

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error posting to Twitter:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to post to Twitter",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
