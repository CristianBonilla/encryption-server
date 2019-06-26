import RSA, { FormatPem, Data } from 'node-rsa';

export type RSAKeySize = 512 | 1024 | 2048 | 4096;

export class RSAEncryption {
  private key: RSA;
  private readonly formatPrivate: FormatPem = 'pkcs1-private-pem';
  private readonly formatPublic: FormatPem = 'pkcs8-public-pem';

  constructor(bits: RSAKeySize = 2048) {
    this.key = new RSA({ b: bits });
  }

  public get publicKey() {
    return this.key.exportKey(this.formatPublic);
  }

  public publicKeyImport(publicKey: string) {
    const keyImported = this.key.importKey(publicKey, this.formatPublic);
    if (!this.validatePublicKey(keyImported)) {
      throw new Error('La clave pública es incorrecta para ser importarla');
    }

    return keyImported;
  }

  public privateKeyImport(privateKey: string) {
    const keyImported = this.key.importKey(privateKey, this.formatPrivate);
    if (!this.validatePrivateKey(keyImported)) {
      throw new Error('La clave privada es incorrecta para ser importada');
    }

    return keyImported;
  }

  public privateKey(keyImported: RSA) {
    return keyImported.exportKey(this.formatPrivate);
  }

  public encrypted(keyImported: RSA, data: Data | number) {
    data = typeof data === 'number' ? data.toString() : data;
    const encrypted = keyImported.encrypt(data, 'buffer');

    return encrypted;
  }

  public decrypted(keyImported: RSA, encrypted: string | Buffer) {
    return keyImported.decrypt(encrypted, 'utf8');
  }

  public validate(keyImported: RSA, data: Data | number) {
    data = typeof data === 'number' ? data.toString() : data;
    const signed = keyImported.sign(data, 'buffer');

    return keyImported.verify(data, signed);
  }

  private validatePublicKey(keyImported: RSA) {
    return keyImported.isPublic() && !keyImported.isEmpty();
  }

  private validatePrivateKey(keyImported: RSA) {
    return keyImported.isPrivate() && !keyImported.isEmpty();
  }
}
