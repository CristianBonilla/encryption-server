import { Router } from 'express';
import { RSAEncryption } from '@core/rsa-encryption';
import { logger } from '@/logger';

export interface SendResponse {
  status: string;
  statusCode: number;
  description: any;
}

export class DocumentRoute {
  private readonly prefixRoute = '/document';
  private readonly rsa: RSAEncryption;

  constructor(private router: Router) {
    this.rsa = new RSAEncryption();
    this.accessControl();
  }

  public routes() {
    const route = this.router.route(this.prefixRoute);

    route.get((request, response) => {
      const publicKey = this.rsa.publicKey;

      response.status(200).send({
        status: 'OK',
        statusCode: 200,
        description: {
          publicKey
        }
      });
    }).post((request, response) => {
      if (typeof request.body !== 'object' ||
        typeof request.body === 'object' &&
        typeof request.body.documentEncrypted !== 'string') {
          response.status(400)
          .send({
            status: 'BadRequest',
            statusCode: 400,
            description: 'Se requiere el documento cifrado correcto para descifrar'
          });
      } else {
        const { documentEncrypted } = request.body as { documentEncrypted: string };

        const privateKeyImported = this.privateKeyImported();
        const decryptedText = this.rsa.decrypted(privateKeyImported, documentEncrypted);

        response.status(200).send({
          status: 'OK',
          statusCode: 200,
          description: {
            documentDecrypted: decryptedText
          }
        });
      }

    });

    this.router.get(`${ this.prefixRoute }/:document`, (request, response) => {
      let { document } = request.params;
      document = parseInt(document, 10);
      if (typeof document !== 'number' || isNaN(document)) {
        response.status(400)
          .send({
            status: 'BadRequest',
            statusCode: 400,
            description: 'El documento no es correcto para procesar'
          });
      } else {
        const publicKeyImported = this.publicKeyImported();
        const encrypted = this.rsa.encrypted(publicKeyImported, document);
        const encryptedText = encrypted.toString('base64');

        response.status(200).send({
          status: 'OK',
          statusCode: 200,
          description: {
            documentEncrypted: encryptedText
          }
        });
      }
    });
  }

  private publicKeyImported() {
    const publicKey = this.rsa.publicKey;
    const publicKeyImport = this.rsa.publicKeyImport(publicKey);

    return publicKeyImport;
  }

  private privateKeyImported() {
    const publicKeyImported = this.publicKeyImported();
    const privateKey = this.rsa.privateKey(publicKeyImported);
    const privateKeyImport = this.rsa.privateKeyImport(privateKey);

    // private key console log
    logger.info(privateKey);

    return privateKeyImport;
  }

  private accessControl() {
    this.router.use(this.prefixRoute, (request, response, next) => {
      response.setHeader('Access-Control-Allow-Origin', 'http://localhost:11300');
      response.setHeader('Access-Control-Allow-Methods', 'GET,POST');
      response.setHeader('Access-Control-Allow-Headers', 'Authorization, X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept');
      // res.setHeader('Access-Control-Allow-Credentials', true);
      // res.setHeader("Access-Control-Max-Age", "1728000");
      next();
    });
  }
}
