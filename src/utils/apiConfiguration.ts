const apiConfiguration = () => {

    // If MOCK_API is set, use the mock API.
    if (process.env.MOCK_API) {
      console.log("Connecting to mock OpenAI API.")
      return {
        baseURL: process.env.MOCK_API,
        apiKey: "",
      };
    }
  
    // If AZURE_API_KEY is set, use the Azure API.
    if (process.env.AZURE_API_KEY) {
      // Azure deployment details
      const azureDomain = "gitwit-production";
      const deployment = "gpt-35-turbo";
      const apiVersion = "2023-07-01-preview";
  
      if (process.env.HELICONE_API_KEY) {
        // Use Azure with Helicone for logging:
        console.log("Connecting to Azure API with Helicone.")
        return {
          baseURL: `https://oai.hconeai.com/openai/deployments/${deployment}`,
          defaultHeaders: {
            "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
            "Helicone-OpenAI-API-Base": `https://${azureDomain}.openai.azure.com`,
            "api-key": process.env.AZURE_API_KEY,
          },
          defaultQuery: {
            "api-version": apiVersion,
          },
          apiKey: "",
        };
      } else {
        // Use Azure directly:
        console.log("Connecting to Azure API.")
        return {
          baseURL: `https://${azureDomain}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
          defaultHeaders: {
            "api-key": process.env.AZURE_API_KEY,
          },
          defaultQuery: {
            "api-version": apiVersion,
          },
          apiKey: "",
        };
      }
    }
  
    // If OPENAI_API_KEY is set, use the OpenAI API.
    if (process.env.OPENAI_API_KEY) {
      if (process.env.HELICONE_API_KEY) {
        // Use OpenAI with Helicone for logging:
        console.log("Connecting to OpenAI API with Helicone.")
        return {
          baseURL: "http://oai.hconeai.com/v1",
          defaultHeaders: {
            "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
          },
        };
      } else {
        // Use OpenAI directly:
        console.log("Connecting to OpenAI API.")
        return {};
      }
    }
  
    throw new Error(
      "No API key found: Please set AZURE_API_KEY or OPENAI_API_KEY."
    );
  };

  export default apiConfiguration;