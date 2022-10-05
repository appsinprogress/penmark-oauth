const CryptoJS = require("crypto-js");

export async function encrypt(plaintext: string, password: string) {
    const pwUtf8 = new TextEncoder().encode(password);                                 
    const pwHash = await CryptoJS.SHA256(pwUtf8)

    const ciphertext = CryptoJS.AES.encrypt(plaintext, password).toString();

    return ciphertext;
  }
  
  export async function decrypt(ciphertext: string, password: string) {

    var bytes  = CryptoJS.AES.decrypt(ciphertext, password);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    return originalText;
  }