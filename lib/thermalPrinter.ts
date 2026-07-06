// Utilitaire pour l'impression Bluetooth sur imprimante thermique
// Supporte les commandes ESC/POS

export class ThermalPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  // USB
  private usbDevice: any | null = null;
  private usbEndpoint: number | null = null;

  private encoder = new TextEncoder();

  // Commandes ESC/POS
  private readonly ESC = '\x1B';
  private readonly GS = '\x1D';
  
  // Commandes de base
  private readonly COMMANDS = {
    INIT: `${this.ESC}@`,
    LINE_FEED: '\n',
    CUT_PAPER: `${this.GS}V\x42\x00`,
    ALIGN_LEFT: `${this.ESC}a\x00`,
    ALIGN_CENTER: `${this.ESC}a\x01`,
    ALIGN_RIGHT: `${this.ESC}a\x02`,
    BOLD_ON: `${this.ESC}E\x01`,
    BOLD_OFF: `${this.ESC}E\x00`,
    UNDERLINE_ON: `${this.ESC}-\x01`,
    UNDERLINE_OFF: `${this.ESC}-\x00`,
    FONT_SIZE_NORMAL: `${this.GS}!\x00`,
    FONT_SIZE_MEDIUM: `${this.GS}!\x11`,
    FONT_SIZE_LARGE: `${this.GS}!\x22`,
    DOUBLE_HEIGHT: `${this.ESC}!\x10`,
    DOUBLE_WIDTH: `${this.ESC}!\x20`,
  };

  /**
   * Vérifie si l'API Bluetooth est disponible
   */
  isBluetoothAvailable(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * Vérifie si l'API USB est disponible
   */
  isUsbAvailable(): boolean {
    return 'usb' in navigator;
  }

  /**
   * Connecte à l'imprimante Bluetooth
   * @param useAcceptAll Si true, affiche tous les appareils Bluetooth (pas de filtre)
   */
  async connect(useAcceptAll: boolean = false): Promise<boolean> {
    try {
      if (!this.isBluetoothAvailable()) {
        throw new Error('Bluetooth non disponible sur ce navigateur');
      }

      console.log('Recherche d\'imprimantes Bluetooth...');
      console.log('Mode:', useAcceptAll ? 'Tous les appareils' : 'Filtré (imprimantes uniquement)');
      
      // Configuration de la requête
      const requestOptions: any = {
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Service d'impression générique
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Service Bluetooth SPP
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Service HM-10 (utilisé par beaucoup d'imprimantes)
          '0000fff0-0000-1000-8000-00805f9b34fb', // Service alternatif
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Nordic UART Service
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service (alternatif)
        ]
      };

      if (useAcceptAll) {
        // Mode "accepter tous" - affiche TOUS les appareils Bluetooth
        requestOptions.acceptAllDevices = true;
      } else {
        // Mode filtré - cherche uniquement les imprimantes
        requestOptions.filters = [
          { namePrefix: 'MobilePrinter' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'BlueTooth Printer' },
          { namePrefix: 'Printer' },
          { namePrefix: 'RPP' },
          { namePrefix: 'BT' },
          { namePrefix: 'POS' },
          { namePrefix: 'BLE' },
          { name: '' }, // Appareils sans nom
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
          { services: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] },
          { services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] },
        ];
      }
      
      // Demander l'accès à un périphérique Bluetooth
      this.device = await navigator.bluetooth.requestDevice(requestOptions);

      if (!this.device) {
        throw new Error('Aucun périphérique sélectionné');
      }

      console.log('✓ Appareil sélectionné:', this.device.name || 'Sans nom');
      console.log('  ID:', this.device.id);

      // Se connecter au serveur GATT
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Impossible de se connecter au serveur GATT');
      }

      console.log('✓ Serveur GATT connecté');

      // Lister tous les services disponibles
      const services = await server.getPrimaryServices();
      console.log(`✓ Services disponibles (${services.length}):`, 
        services.map(s => s.uuid).join(', '));

      // Essayer de trouver un service avec une caractéristique d'écriture
      let serviceFound = false;
      for (const service of services) {
        try {
          console.log(`  Analyse du service: ${service.uuid}`);
          const characteristics = await service.getCharacteristics();
          
          for (const char of characteristics) {
            console.log(`    Caractéristique: ${char.uuid}`);
            console.log(`    Propriétés:`, {
              read: char.properties.read,
              write: char.properties.write,
              writeWithoutResponse: char.properties.writeWithoutResponse,
              notify: char.properties.notify
            });
            
            if (char.properties.write || char.properties.writeWithoutResponse) {
              this.characteristic = char;
              serviceFound = true;
              console.log('✓ Caractéristique d\'écriture trouvée!');
              break;
            }
          }
          
          if (serviceFound) break;
        } catch (error) {
          console.log(`  Erreur lors de l'analyse du service ${service.uuid}:`, error);
        }
      }

      if (!this.characteristic) {
        throw new Error(
          'Aucune caractéristique d\'écriture trouvée.\n' +
          'Votre imprimante utilise peut-être un protocole différent.\n' +
          'Consultez la documentation de votre imprimante pour les UUIDs.'
        );
      }

      console.log('✓ Imprimante connectée avec succès!');
      
      // Initialiser l'imprimante
      await this.sendCommand(this.COMMANDS.INIT);
      console.log('✓ Imprimante initialisée');
      
      return true;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      
      // Messages d'erreur personnalisés
      if (error.message.includes('User cancelled')) {
        throw new Error(
          'Connexion annulée.\n\n' +
          'Assurez-vous que :\n' +
          '• Votre imprimante est allumée\n' +
          '• Le Bluetooth est activé\n' +
          '• Vous sélectionnez un appareil dans la liste\n\n' +
          'Si votre imprimante n\'apparaît pas, essayez le mode "Tous les appareils".'
        );
      }
      
      throw error;
    }
  }

  /**
   * Connecte à l'imprimante via USB
   */
  async connectUsb(): Promise<boolean> {
    try {
      if (!this.isUsbAvailable()) {
        throw new Error('USB non disponible sur ce navigateur');
      }

      console.log('Recherche d\'imprimantes USB...');

      const nav = navigator as any; // Bypass TS strict
      this.usbDevice = await nav.usb.requestDevice({
        filters: [] // Accepter tous
      });

      if (!this.usbDevice) {
        throw new Error('Aucun périphérique sélectionné');
      }

      console.log('✓ Appareil USB sélectionné:', this.usbDevice.productName || 'Sans nom');

      await this.usbDevice.open();

      // Sélectionner la configuration par défaut
      if (this.usbDevice.configuration === null) {
        await this.usbDevice.selectConfiguration(1);
      }

      // Trouver l'interface et le endpoint OUT
      let interfaceNumber = -1;
      let endpointNumber = -1;

      for (const iface of this.usbDevice.configuration.interfaces) {
        for (const alternate of iface.alternates) {
          for (const endpoint of alternate.endpoints) {
            if (endpoint.direction === 'out' && endpoint.type === 'bulk') {
              interfaceNumber = iface.interfaceNumber;
              endpointNumber = endpoint.endpointNumber;
              break;
            }
          }
          if (interfaceNumber !== -1) break;
        }
        if (interfaceNumber !== -1) break;
      }

      if (interfaceNumber === -1 || endpointNumber === -1) {
        throw new Error('Ce périphérique ne semble pas être une imprimante compatible (pas de endpoint Bulk OUT)');
      }

      await this.usbDevice.claimInterface(interfaceNumber);
      this.usbEndpoint = endpointNumber;

      console.log('✓ Imprimante USB connectée avec succès!');

      await this.sendCommand(this.COMMANDS.INIT);

      return true;
    } catch (error: any) {
      console.error('❌ Erreur de connexion USB:', error);
      if (error.message.includes('No device selected')) {
        throw new Error('Connexion annulée.');
      }
      if (error.name === 'SecurityError') {
        throw new Error('L\'accès USB est bloqué par le navigateur.');
      }
      throw error;
    }
  }

  /**
   * Tente de reconnecter automatiquement à l'imprimante USB déjà autorisée
   */
  async autoConnectUsb(): Promise<boolean> {
    try {
      if (!this.isUsbAvailable() || this.isConnected()) return this.isConnected();
      
      const nav = navigator as any;
      const devices = await nav.usb.getDevices();

      if (devices && devices.length > 0) {
        for (const device of devices) {
          try {
            await device.open();
            if (device.configuration === null) {
              await device.selectConfiguration(1);
            }
            let interfaceNumber = -1;
            let endpointNumber = -1;
            for (const iface of device.configuration.interfaces) {
              for (const alternate of iface.alternates) {
                for (const endpoint of alternate.endpoints) {
                  if (endpoint.direction === 'out' && endpoint.type === 'bulk') {
                    interfaceNumber = iface.interfaceNumber;
                    endpointNumber = endpoint.endpointNumber;
                    break;
                  }
                }
                if (interfaceNumber !== -1) break;
              }
              if (interfaceNumber !== -1) break;
            }

            if (interfaceNumber !== -1 && endpointNumber !== -1) {
              await device.claimInterface(interfaceNumber);
              this.usbDevice = device;
              this.usbEndpoint = endpointNumber;
              await this.sendCommand(this.COMMANDS.INIT);
              console.log('✓ Auto-reconnexion USB réussie !');
              return true;
            }
          } catch (e) {
            console.warn('Echec auto-connexion USB sur un appareil:', e);
          }
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Déconnecte l'imprimante
   */
  async disconnect(): Promise<void> {
    if (this.device && this.device.gatt?.connected) {
      await this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    
    if (this.usbDevice && this.usbDevice.opened) {
      await this.usbDevice.close();
    }
    this.usbDevice = null;
    this.usbEndpoint = null;
  }

  /**
   * Vérifie si l'imprimante est connectée
   */
  isConnected(): boolean {
    return (this.device?.gatt?.connected ?? false) || (this.usbDevice?.opened ?? false);
  }

  /**
   * Envoie une commande à l'imprimante
   */
  private async sendCommand(command: string): Promise<void> {
    const data = this.encoder.encode(command);
    
    if (this.characteristic) {
      // Diviser en chunks de 512 bytes maximum pour la compatibilité Bluetooth
      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        // Petit délai entre les chunks
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } else if (this.usbDevice && this.usbEndpoint !== null) {
      // Transfert direct pour l'USB
      await this.usbDevice.transferOut(this.usbEndpoint, data);
    } else {
      throw new Error('Imprimante non connectée');
    }
  }

  /**
   * Envoie des données binaires brutes à l'imprimante
   */
  private async sendRawData(data: Uint8Array): Promise<void> {
    if (this.characteristic) {
      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } else if (this.usbDevice && this.usbEndpoint !== null) {
      await this.usbDevice.transferOut(this.usbEndpoint, data);
    } else {
      throw new Error('Imprimante non connectée');
    }
  }

  /**
   * Imprime un QR code
   */
  async printQRCode(text: string): Promise<void> {
    try {
      const encoder = new TextEncoder();
      const textData = encoder.encode(text);
      const pL = (textData.length + 3) & 0xFF;
      const pH = ((textData.length + 3) >> 8) & 0xFF;
      
      // Select model
      await this.sendRawData(new Uint8Array([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]));
      // Size (reduced from 6 to 4 for smaller QR)
      await this.sendRawData(new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x04]));
      // Error correction (M=49, Q=50)
      await this.sendRawData(new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]));
      // Store data
      const header = new Uint8Array([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]);
      const dataPacket = new Uint8Array(header.length + textData.length);
      dataPacket.set(header);
      dataPacket.set(textData, header.length);
      await this.sendRawData(dataPacket);
      // Print
      await this.sendRawData(new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]));
    } catch (e) {
      console.error('Erreur QR Code:', e);
    }
  }

  /**
   * Imprime une image (logo) depuis une URL
   */
  async printImage(imageUrl: string, align: 'left' | 'center' | 'right' = 'center', maxWidth: number = 200): Promise<void> {
    try {
      if (align === 'center') {
        await this.sendCommand(this.COMMANDS.ALIGN_CENTER);
      } else if (align === 'right') {
        await this.sendCommand(this.COMMANDS.ALIGN_RIGHT);
      } else {
        await this.sendCommand(this.COMMANDS.ALIGN_LEFT);
      }

      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Erreur chargement image'));
        img.src = imageUrl;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      const bytesPerLine = Math.ceil(width / 8);

      // GS v 0 m xL xH yL yH d1...dk
      const header = new Uint8Array([
        0x1D, 0x76, 0x30, 0x00, 
        bytesPerLine & 0xFF, (bytesPerLine >> 8) & 0xFF, 
        height & 0xFF, (height >> 8) & 0xFF,
      ]);

      const bufferData = new Uint8Array(header.length + (bytesPerLine * height));
      bufferData.set(header);

      let offset = header.length;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < bytesPerLine; x++) {
          let byte = 0;
          for (let bit = 0; bit < 8; bit++) {
            const pixelX = x * 8 + bit;
            if (pixelX < width) {
              const i = (y * width + pixelX) * 4;
              const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
              if (gray < 128) {
                byte |= 1 << (7 - bit);
              }
            }
          }
          bufferData[offset++] = byte;
        }
      }

      await this.sendRawData(bufferData);
      await this.sendCommand(this.COMMANDS.ALIGN_LEFT);
    } catch (error) {
      console.error('Erreur lors de l\'impression de l\'image:', error);
    }
  }

  /**
   * Imprime du texte avec options
   */
  async printText(
    text: string,
    options: {
      align?: 'left' | 'center' | 'right';
      bold?: boolean;
      underline?: boolean;
      size?: 'normal' | 'medium' | 'large';
      lineBreak?: boolean;
    } = {}
  ): Promise<void> {
    let command = '';

    // Alignement
    if (options.align === 'center') {
      command += this.COMMANDS.ALIGN_CENTER;
    } else if (options.align === 'right') {
      command += this.COMMANDS.ALIGN_RIGHT;
    } else {
      command += this.COMMANDS.ALIGN_LEFT;
    }

    // Taille
    if (options.size === 'large') {
      command += this.COMMANDS.FONT_SIZE_LARGE;
    } else if (options.size === 'medium') {
      command += this.COMMANDS.FONT_SIZE_MEDIUM;
    } else {
      command += this.COMMANDS.FONT_SIZE_NORMAL;
    }

    // Gras
    if (options.bold) {
      command += this.COMMANDS.BOLD_ON;
    }

    // Souligné
    if (options.underline) {
      command += this.COMMANDS.UNDERLINE_ON;
    }

    // Texte
    command += text;

    // Désactiver les styles
    if (options.bold) {
      command += this.COMMANDS.BOLD_OFF;
    }
    if (options.underline) {
      command += this.COMMANDS.UNDERLINE_OFF;
    }

    // Saut de ligne
    if (options.lineBreak !== false) {
      command += this.COMMANDS.LINE_FEED;
    }

    await this.sendCommand(command);
  }

  /**
   * Imprime une ligne de séparation
   */
  async printLine(char: string = '-', length: number = 32): Promise<void> {
    await this.printText(char.repeat(length), { align: 'left' });
  }

  /**
   * Avance le papier
   */
  async feedLines(lines: number = 1): Promise<void> {
    await this.sendCommand(this.COMMANDS.LINE_FEED.repeat(lines));
  }

  /**
   * Coupe le papier (si supporté)
   */
  async cutPaper(): Promise<void> {
    await this.feedLines(3);
    await this.sendCommand(this.COMMANDS.CUT_PAPER);
  }

  /**
   * Imprime une facture complète
   */
  async printFacture(facture: any, entreprise: any): Promise<void> {
    try {
      // Initialiser
      await this.sendCommand(this.COMMANDS.INIT);
      await this.feedLines(1);

      // En-tête
      await this.printText(entreprise.nom.toUpperCase(), {
        align: 'center',
        bold: true,
        size: 'medium'
      });

      if (entreprise.slogan) {
        await this.printText(entreprise.slogan, {
          align: 'center',
          size: 'normal'
        });
      }

      await this.printText(entreprise.adresse || '', {
        align: 'center',
        size: 'normal'
      });

      await this.printText(`Tel: ${entreprise.telephone}`, {
        align: 'center',
        size: 'normal'
      });

      await this.feedLines(1);
      await this.printLine('=', 32);
      await this.feedLines(1);

      // Titre
      await this.printText('FACTURE', {
        align: 'center',
        bold: true,
        size: 'medium'
      });

      await this.feedLines(1);

      // Informations facture
      await this.printText(`N°: ${facture.id || facture.numero || ''}`, {
        align: 'left'
      });

      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.getDate().toString().padStart(2, '0') + "/" + (date.getMonth() + 1).toString().padStart(2, '0') + "/" + date.getFullYear();
      };

      await this.printText(`Date: ${formatDate(facture.createdAt || new Date().toISOString())}`, {
        align: 'left'
      });

      if (facture.client?.nom || facture.client?.prenom) {
        await this.printText(`Client: ${facture.client?.nom || ''} ${facture.client?.prenom || ''}`, {
          align: 'left'
        });
      }

      if (facture.client?.numero) {
        await this.printText(`Tel: ${facture.client.numero}`, {
          align: 'left'
        });
      }

      await this.feedLines(1);
      await this.printLine('-', 32);
      await this.feedLines(1);

      // Dates importantes
      await this.printText('INFORMATIONS', {
        align: 'left',
        bold: true
      });

      if (facture.dateDepot) {
        await this.printText(`Depot: ${formatDate(facture.dateDepot)}`, {
          align: 'left'
        });
      }

      if (facture.dateRetrait) {
        await this.printText(`Retrait: ${formatDate(facture.dateRetrait)}`, {
          align: 'left'
        });
      }

      await this.feedLines(1);
      await this.printLine('-', 32);
      await this.feedLines(1);

      // Mesures
      await this.printText('MESURES', {
        align: 'left',
        bold: true
      });

      await this.feedLines(1);

      const formatMontant = (montant: number | string) => {
        const num = typeof montant === 'string' ? parseFloat(montant) : montant;
        const curSym = entreprise?.devise?.symbole || 'FCFA';
        if (isNaN(num)) return '0 ' + curSym;
        
        // Formater manuellement pour éviter les caractères spéciaux
        // Utiliser uniquement des caractères ASCII standard
        const numStr = Math.round(num).toString();
        
        // Ajouter des espaces tous les 3 chiffres en partant de la droite
        let formatted = '';
        for (let i = 0; i < numStr.length; i++) {
          if (i > 0 && (numStr.length - i) % 3 === 0) {
            formatted += ' ';  // Espace normal ASCII
          }
          formatted += numStr[i];
        }
        
        return formatted + ' ' + curSym;
      };

      if (facture.mesures && Array.isArray(facture.mesures)) {
        for (const mesure of facture.mesures) {
          const libelle = mesure.typeMesure?.libelle || 'Mesure';
          const montant = formatMontant(mesure.montant || 0);
          
          // Créer une ligne avec espacement
          const lineLength = 32;
          const spaces = lineLength - libelle.length - montant.length;
          const line = libelle + ' '.repeat(Math.max(1, spaces)) + montant;
          
          await this.printText(line, { align: 'left' });

          if (mesure.remise > 0) {
            await this.printText(`  Remise: -${formatMontant(mesure.remise)}`, {
              align: 'left'
            });
          }
        }
      } else {
        await this.printText('Aucune mesure', { align: 'left' });
      }

      await this.feedLines(1);
      await this.printLine('=', 32);
      await this.feedLines(1);

      // Récapitulatif financier
      await this.printText('RECAPITULATIF', {
        align: 'left',
        bold: true
      });

      await this.feedLines(1);

      const avance = parseFloat(facture.avance) || 0;
      const montantTotal = parseFloat(facture.MontantTotal) || 0;
      const remise = parseFloat(facture.remise) || 0;
      const reste = parseFloat(facture.ResteArgent) || 0;
      const sousTotal = montantTotal + remise;

      // Fonction helper pour créer des lignes avec espacement
      const createLine = (label: string, value: string) => {
        const lineLength = 32;
        const spaces = lineLength - label.length - value.length;
        return label + ' '.repeat(Math.max(1, spaces)) + value;
      };

      await this.printText(createLine('Sous-total:', formatMontant(sousTotal)), {
        align: 'left'
      });

      if (remise > 0) {
        await this.printText(createLine('Remise:', `-${formatMontant(remise)}`), {
          align: 'left'
        });
      }

      await this.printText(createLine('TOTAL:', formatMontant(montantTotal)), {
        align: 'left',
        bold: true
      });

      if (avance > 0) {
        await this.printText(createLine('Avance:', `-${formatMontant(avance)}`), {
          align: 'left'
        });
      }

      await this.feedLines(1);
      await this.printLine('=', 32);
      await this.feedLines(1);

      await this.printText(createLine('RESTE A PAYER:', formatMontant(reste)), {
        align: 'left',
        bold: true,
        size: 'medium'
      });

      await this.feedLines(2);

      // Informations importantes
      await this.printText('INFORMATIONS IMPORTANTES', {
        align: 'left',
        bold: true
      });

      await this.feedLines(1);

      await this.printText('Presentez ce recu pour', { align: 'left' });
      await this.printText('retirer votre commande', { align: 'left' });

      if (facture.dateRetrait) {
        await this.feedLines(1);
        await this.printText(`Date limite: ${formatDate(facture.dateRetrait)}`, {
          align: 'left'
        });
      }

      await this.feedLines(1);
      await this.printText('Payez le solde a la livraison', { align: 'left' });

      await this.feedLines(1);
      await this.printLine('-', 32);
      await this.printLine('-', 32);
      await this.feedLines(1);

      // Pied de page
      await this.printText('MERCI DE VOTRE CONFIANCE !', {
        align: 'center',
        bold: true
      });

      await this.feedLines(1);

      const now = new Date();
      await this.printText(
        `Imprime le ${now.toLocaleDateString('fr-FR')} a ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        { align: 'center' }
      );

      await this.printText(`Facture #${facture.id || ''}`, {
        align: 'center'
      });

      await this.feedLines(1);

      await this.printText('Conservez ce ticket', {
        align: 'center'
      });

      await this.printText(`Contact: ${entreprise.telephone}`, {
        align: 'center'
      });

      // Couper le papier
      await this.cutPaper();

      console.log('Impression terminée avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      throw error;
    }
  }

  /**
   * Imprime une facture simplifiée (version courte et épurée)
   * Version minimaliste pour utilisateurs formés - économise ~40% de papier
   */
  async printFactureSimple(facture: any, entreprise: any): Promise<void> {
    try {
      // Initialiser
      await this.sendCommand(this.COMMANDS.INIT);
      await this.feedLines(1);

      // En-tête simple
      await this.printText(entreprise.nom.toUpperCase(), {
        align: 'center',
        bold: true,
        size: 'medium'
      });

      await this.printText(entreprise.telephone || '', {
        align: 'center',
        size: 'normal'
      });

      await this.feedLines(1);
      await this.printLine('-', 32);
      await this.feedLines(1);

      // Info facture
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.getDate().toString().padStart(2, '0') + "/" + (date.getMonth() + 1).toString().padStart(2, '0') + "/" + date.getFullYear();
      };

      const formatMontant = (montant: number | string) => {
        const num = typeof montant === 'string' ? parseFloat(montant) : montant;
        if (isNaN(num)) return '0';
        
        // Formater manuellement pour éviter les caractères spéciaux
        const numStr = Math.round(num).toString();
        let formatted = '';
        for (let i = 0; i < numStr.length; i++) {
          if (i > 0 && (numStr.length - i) % 3 === 0) {
            formatted += ' ';
          }
          formatted += numStr[i];
        }
        return formatted;
      };

      // Ligne N° et Date
      const infoLine = `N°${facture.id}  ${formatDate(facture.createdAt || new Date().toISOString())}`;
      await this.printText(infoLine, { align: 'left' });

      // Client si présent
      if (facture.client?.nom || facture.client?.prenom) {
        await this.printText(
          `${facture.client?.nom || ''} ${facture.client?.prenom || ''}`,
          { align: 'left' }
        );
      }

      await this.feedLines(1);
      await this.printLine('-', 32);
      await this.feedLines(1);

      // Articles
      if (facture.mesures && Array.isArray(facture.mesures)) {
        for (const mesure of facture.mesures) {
          const libelle = mesure.typeMesure?.libelle || 'Article';
          const montant = formatMontant(mesure.montant || 0);
          
          // Créer ligne avec espacement
          const maxLength = 32;
          const priceText = `${montant}F`;
          const spaces = maxLength - libelle.length - priceText.length;
          const line = libelle + ' '.repeat(Math.max(1, spaces)) + priceText;
          
          await this.printText(line, { align: 'left' });
        }
      }

      await this.feedLines(1);
      await this.printLine('=', 32);
      await this.feedLines(1);

      // Totaux
      const montantTotal = parseFloat(facture.MontantTotal) || 0;
      const avance = parseFloat(facture.avance) || 0;
      const reste = parseFloat(facture.ResteArgent) || 0;

      // Fonction helper pour créer des lignes
      const createLine = (label: string, value: string) => {
        const maxLength = 32;
        const spaces = maxLength - label.length - value.length;
        return label + ' '.repeat(Math.max(1, spaces)) + value;
      };

      // Total
      await this.printText(
        createLine('TOTAL', `${formatMontant(montantTotal)} ${entreprise?.devise?.symbole || 'FCFA'}`),
        { align: 'left', bold: true }
      );

      // Avance si présente
      if (avance > 0) {
        await this.printText(
          createLine('Avance', `-${formatMontant(avance)}F`),
          { align: 'left' }
        );
      }

      await this.feedLines(1);
      await this.printLine('-', 32);

      // Reste à payer
      await this.printText(
        createLine('RESTE', `${formatMontant(reste)} ${entreprise?.devise?.symbole || 'FCFA'}`),
        { align: 'left', bold: true, size: 'medium' }
      );

      // Date de retrait
      if (facture.dateRetrait) {
        await this.feedLines(1);
        await this.printLine('-', 32);
        await this.printText('Retrait', { align: 'center' });
        await this.printText(
          formatDate(facture.dateRetrait),
          { align: 'center', bold: true }
        );
      }

      await this.feedLines(2);

      // Pied de page simple
      await this.printText('Merci de votre confiance', {
        align: 'center'
      });

      await this.feedLines(1);

      const now = new Date();
      await this.printText(
        `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        { align: 'center' }
      );

      // Couper le papier
      await this.cutPaper();

      console.log('✓ Impression simplifiée terminée (~15cm au lieu de ~25cm)');
    } catch (error) {
      console.error('❌ Erreur impression simplifiée:', error);
      throw error;
    }
  }

  /**
   * Imprime un reçu de vente (Moomen)
   */
  async printMoomenReceipt(vente: any, entreprise: any): Promise<void> {
    try {
      // Configuration initiale
      await this.sendCommand(this.COMMANDS.INIT);

      console.log('📌 TRACE : INFO MAGASIN SÉLECTIONNÉ POUR LE REÇU ->', entreprise);
      
      // Logo du magasin ou Logo textuel MP s'il n'y a pas d'image
      const finalLogoUrl = entreprise?.image_url || entreprise?.logo || entreprise?.image || null;
      if (finalLogoUrl) {
        let logoUrl = finalLogoUrl;
        
        // Extraire un chemin absolu si le backend nous renvoie "https://dev.moomen.pro/files/images/..."
        if (logoUrl.startsWith('http')) {
          try {
            const urlData = new URL(logoUrl);
            logoUrl = urlData.pathname + urlData.search;
          } catch(e) {}
        }
        
        // Le navigateur appelera "/files/images/mag_66.jpg" et comme on a configuré le proxy dans NextJs
        // Il transférera cette requête au backend dev.moomen.pro à distance, sans que le système se bloque à cause d'une erreur CORS !
        await this.printImage(logoUrl, 'center', 160);
        await this.feedLines(1);
      } else {
        await this.printText('MP', {
          align: 'center',
          bold: true,
          size: 'large'
        });
        await this.feedLines(1);
      }

      // Nom Boutique
      const nomEntreprise = entreprise?.nom || entreprise?.raisonSociale || entreprise?.libelle || 'Boutique Moomen';
      await this.printText(nomEntreprise, {
        align: 'center',
        size: 'normal'
      });
      await this.printLine('-', 32);

      // Format des dates en français comme "18 Mars 2026   13:36"
      const dateStr = vente.date_vente || vente.created_at || new Date().toISOString();
      const d = new Date(dateStr);
      const mois = ["Jan", "Fev", "Mars", "Avril", "Mai", "Juin", "Juil", "Aout", "Sept", "Oct", "Nov", "Dec"];
      const strDatePart = `${d.getDate().toString().padStart(2, '0')} ${mois[d.getMonth()]} ${d.getFullYear()}`.padEnd(14, ' ');
      const strTimePart = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`.padStart(6, ' ');

      // En-tête info (Recu, Date, Client)
      const refLine = 'Recu n'.padEnd(10, ' ') + ' '.repeat(10) + (vente.id?.toString() || vente.ref_vente || '---').padStart(12, ' ');
      await this.printText(refLine, { align: 'left' });
      
      const dateLine = 'Date'.padEnd(10, ' ') + strDatePart + strTimePart;
      await this.printText(dateLine, { align: 'left' });

      if (vente.client?.nom || vente.client?.prenom) {
        let clientStr = (vente.client?.nom || '') + ' ' + (vente.client?.prenom || '');
        clientStr = clientStr.trim().substring(0, 15);
        const clientLine = 'Client'.padEnd(10, ' ') + ' '.repeat(7) + clientStr.padStart(15, ' ');
        await this.printText(clientLine, { align: 'left' });
      }

      await this.printLine('-', 32);

      // Articles header (exactement 32 caractères pour alignement)
      // On alloue: Lib(11) | PU(8) | Qte(5) | Total(8)
      const headerStr = 'Desc.'.padEnd(11, ' ') + 'P.U.'.padStart(8, ' ') + 'Qte'.padStart(5, ' ') + 'Total'.padStart(8, ' ');
      await this.printText(headerStr, { align: 'left' });

      // Fonction d'aide pour forcer l'entier avec .0 si désiré, ou afficher complet
      const formatMontant = (num: number | string) => {
        const val = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(val)) return '0.0';
        const curSym = entreprise?.devise?.symbole || '';
        const nbDec = entreprise?.devise?.nb_decimal ?? 1;
        return val.toLocaleString('fr-FR', { minimumFractionDigits: nbDec, maximumFractionDigits: nbDec }) + (curSym ? ' ' + curSym : '');
      };

      // Compatibilité exhaustive pour le tableau d'articles
      const lignesItems = vente.lignes_vente || vente.ligne_vente_produit || vente.lignes_vente_produits || vente.lignes || vente.produits || [];

      if (lignesItems && Array.isArray(lignesItems) && lignesItems.length > 0) {
        for (const ligne of lignesItems) {
          // Gère les multiples noms renvoyés par l'API ou le formulaire en cache
          const rawLib = (ligne.article?.libelle || ligne.produit_service?.libelle || ligne.libelle || ligne.detail?.libelle || 'Article').trim();
          
          const rawPu = ligne.prix_unitaire !== undefined ? ligne.prix_unitaire : (ligne.prix || 0);
          // PU sur 8 char maxi
          const puStr = formatMontant(rawPu).padStart(8, ' ').substring(0, 8);
          
          const rawQte = ligne.quantite !== undefined ? ligne.quantite : 1;
          // Qte sur 5 char maxi
          const qteStr = parseFloat(rawQte).toFixed(1).padStart(5, ' ').substring(0, 5);
          
          const rawTotal = ligne.prix_total !== undefined ? ligne.prix_total : (rawPu * rawQte);
          // Total sur 8 char maxi
          const totalStr = formatMontant(rawTotal).padStart(8, ' ').substring(0, 8);

          // Impression libellé sur 11 caractères exactement
          let libelleChunk = rawLib.substring(0, 11).padEnd(11, ' ');
          
          // La ligne fait mathématiquement 11 + 8 + 5 + 8 = 32 caractères EXACTS.
          let lineStr = libelleChunk + puStr + qteStr + totalStr;
          await this.printText(lineStr, { align: 'left' });

          // Si le libellé est plus long, on l'affiche en dessous
          if (rawLib.length > 11) {
            let remaining = rawLib.substring(11).trim();
            while (remaining.length > 0) {
              await this.printText(remaining.substring(0, 32), { align: 'left' });
              remaining = remaining.substring(32).trim();
            }
          }
        }
      }

      await this.printLine('-', 32);

      // Totaux
      const montantTotal = parseFloat(vente.montant_ttc || vente.montant_total) || 0;
      const remise = parseFloat(vente.remise || vente.montant_remise) || 0;
      const totalHT = montantTotal; // En supposant que le total TTC = HT si sans taxe stricte à ce stade (suivant l'image)
      const regle = parseFloat(vente.montant_regle || vente.regle) || 0;
      const reste = Math.max(0, montantTotal - regle);

      const createTotLine = (label: string, value: string) => {
        const valStr = formatMontant(value);
        const lineLength = 32;
        const spaces = Math.max(1, lineLength - label.length - valStr.length);
        return label + ' '.repeat(spaces) + valStr;
      };

      await this.printText(createTotLine('Remise', remise.toString()), { align: 'left' });
      await this.printText(createTotLine('Total HT', totalHT.toString()), { align: 'left' });
      await this.printText(createTotLine('Total TTC', montantTotal.toString()), { align: 'left' });
      await this.printText(createTotLine('Total taxe', '0.0'), { align: 'left' });
      await this.printText(createTotLine('Reste a payer', reste.toString()), { align: 'left' });

      await this.printLine('-', 32);

      // QR Code
      await this.sendCommand(this.COMMANDS.ALIGN_CENTER);
      await this.feedLines(1);
      const qrData = vente.reference || vente.id || 'MERCI';
      await this.printQRCode(qrData.toString());
      await this.feedLines(1);

      // Footer
      // Evite accent pour respecter la console ASCII ESC/POS standard "a bientot" au lieu de "à bientôt" / ou "o" si encodage cassé
      await this.printText('Merci et a bientot !', { align: 'center' });
      
      await this.cutPaper();
    } catch (error) {
      console.error('❌ Erreur impression ticket:', error);
      throw error;
    }
  }
}

// Export de la classe et de l'instance singleton
/* export { ThermalPrinter }; */
export const thermalPrinter = new ThermalPrinter();