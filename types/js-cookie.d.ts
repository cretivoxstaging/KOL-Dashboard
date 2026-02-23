declare module 'js-cookie' {
  interface CookieAttributes {
    path?: string;
    domain?: string;
    expires?: number | Date;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }

  interface Cookies {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: CookieAttributes): void;
    remove(name: string, options?: CookieAttributes): void;
  }

  const Cookies: Cookies;
  export = Cookies;
}
