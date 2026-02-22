// Utilitaire pour l'impression Bluetooth sur imprimante thermique
// Supporte les commandes ESC/POS

export class ThermalPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
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
   * Déconnecte l'imprimante
   */
  async disconnect(): Promise<void> {
    if (this.device && this.device.gatt?.connected) {
      await this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }

  /**
   * Vérifie si l'imprimante est connectée
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  /**
   * Envoie une commande à l'imprimante
   */
  private async sendCommand(command: string): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Imprimante non connectée');
    }

    const data = this.encoder.encode(command);
    
    // Diviser en chunks de 512 bytes maximum pour la compatibilité
    const chunkSize = 512;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      // Petit délai entre les chunks
      await new Promise(resolve => setTimeout(resolve, 50));
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
        if (isNaN(num)) return '0 FCFA';
        
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
        
        return formatted + ' FCFA';
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
        createLine('TOTAL', `${formatMontant(montantTotal)} FCFA`),
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
        createLine('RESTE', `${formatMontant(reste)} FCFA`),
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
}

// Export de la classe et de l'instance singleton
/* export { ThermalPrinter }; */
export const thermalPrinter = new ThermalPrinter();