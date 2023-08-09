Object.defineProperty(window.Navigator, "onLine", {
  get() {
    return true;
  },
});

let cookieData = "";
Object.defineProperty(window.document, "cookie", {
  get() {
    return cookieData;
  },
  set(cookieValue: string) {
    const cookies = cookieData.split("; ");
    const parts = cookieValue.split("; ");
    const expirePart = parts.find((p) => p.startsWith("expires"));
    let isExpired = false;
    if (expirePart) {
      const expire = expirePart.split("=")[1];
      if (!expire) {
        throw new Error("Invalid expire format");
      }
      isExpired = new Date() > new Date(expire);
    }
    const cookieName = parts[0].split("=").shift();
    if (!cookieName) {
      throw new Error("Invalid cookie to set");
    }
    const cookieNameLength = cookieName.length;
    let cookieIndex = -1;
    cookies.forEach((value, index) => {
      if (`${value.substring(0, cookieNameLength)}=` === `${cookieName}=`) {
        cookieIndex = index;
      }
    });
    if (cookieIndex > -1) {
      if (isExpired) {
        cookies.splice(cookieIndex, 1);
      } else {
        cookies[cookieIndex] = `${cookieValue}`;
      }
    } else {
      if (!isExpired) {
        cookies.push(`${cookieValue}`);
      }
    }
    cookieData = cookies.join("; ").trim();
  },
});
