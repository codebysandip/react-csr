import { Request, Response } from "express";

export class CookieService {
  public static get(name: string, req?: Request) {
    if (process.env.IS_SERVER && !req) {
      throw new Error("req parameter cannot be null or undefined to get cookie in SSR");
    }
    const cookie = process.env.IS_SERVER ? req?.headers.cookie : document.cookie;
    const allCookies = cookie?.split("; ");
    if (!allCookies) {
      return undefined;
    }
    const cookiePart: string | undefined = allCookies.find((c) => c.split("=")[0].trim() === name);
    return cookiePart ? cookiePart.split("=")[1].trim() : undefined;
  }

  public static set(name: string, value: string, dateOrDays: number | Date = 10, res?: Response) {
    let cookie = "";
    if (process.env.IS_SERVER) {
      if (!res) {
        throw new Error(`node resp object cannot be ${typeof res} to set cookie in SSR`);
      }
    }

    let date: Date;
    let expires = "";
    if (typeof dateOrDays === "number") {
      date = new Date();
      date.setTime(date.getTime() + dateOrDays * 24 * 60 * 60 * 1000);
      expires = "expires=" + date;
    } else if (dateOrDays instanceof Date) {
      expires = `expires=${dateOrDays}`;
    } else {
      throw new Error(`dateOrDays can be of type number or Date`);
    }
    cookie = `${name}=${value}; ${expires}; path=/`;
    if (process.env.IS_SERVER) {
      res?.setHeader("Set-Cookie", cookie);
    } else {
      document.cookie = cookie;
    }
  }

  public static delete(name: string, res?: Response) {
    if (process.env.IS_SERVER) {
      if (!res) {
        throw new Error(`node resp object cannot be ${typeof res} to set cookie in SSR`);
      }
    }
    const date = new Date();
    date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);

    const cookie = `${name}=; expires=${date}; path=/`;
    if (process.env.IS_SERVER) {
      res?.cookie(`${name}`, "", {
        expires: date,
        path: "/"
      });
    } else {
      document.cookie = cookie;
    }
  }
}
