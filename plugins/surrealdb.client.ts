import { Surreal } from "surrealdb";

const db = new Surreal();
const authenticated = ref(false);
const connected = ref(false);
const activated = ref(false);
db.subscribe("connected", () => { connected.value = true; });
db.subscribe("disconnected", () => { connected.value = false; });
db.subscribe("auth", (tokens) => {
  authenticated.value = Boolean(tokens);
  if (!tokens) activated.value = false;
});

let alreadyFailed = false;
async function connect() {
  connected.value = false;
  const config = useRuntimeConfig();
  const urls = [...config.public.surrealdb_urls];
  if (process.env.NODE_ENV === "development") {
    urls.push("http://localhost:8000");
  }
  try {
    if (!urls.length) throw new Error("No database URLs configured");
    const url = await Promise.any(urls.map(async (url) => {
      const response = await fetch(new URL("/health", url), { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`Database health check returned ${response.status}`);
      return new URL("/rpc", url).href.replace(/^http/, "ws");
    }));
    await db.connect(url, {
      namespace: "news",
      database: "news",
    });
    connected.value = true;
    alreadyFailed = false;
  } catch (error) {
    const message = "Failed to connect to the database";
    if (alreadyFailed) return;
    alreadyFailed = true;
    useToast().add({
      title: "connection error",
      description: message,
      color: "red",
      timeout: 0,
    });
  }
}

async function login(): Promise<boolean> {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return false;
  try {
    await db.authenticate(jwt);
    authenticated.value = true;
    await update_activated();
    return true;
  } catch (error: any) {
    authenticated.value = false;
    window.localStorage.removeItem("jwt");
    useToast().add({
      color: "red",
      title: "Authentication failed",
      description: error.toString(),
    });
    navigateTo("/login?expired");
    return false;
  }
}

async function update_activated() {
  try {
    const user = await db.auth<{ activated: boolean }>();
    if (user?.activated) {
      activated.value = true;
    } else {
      throw new Error("User not activated");
    }
  } catch (error) {
    activated.value = false;
    useToast().add({
      id: "activation_notice",
      color: "red",
      title: "your account needs to be activated",
      description: "please contact the administrator to have access.",
      timeout: 0,
    });
  }
}

export default defineNuxtPlugin(async () => {
  (async () => {
    await connect();
    if (connected.value) {
      await login();
    }
  })();
  return {
    provide: {
      db: db,
      dbhelper: {
        authenticated,
        connected,
        activated,
        login,
        connect,
        update_activated,
      },
    },
  };
});
