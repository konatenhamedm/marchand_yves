"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useMagasin } from "@/context/MagasinContext";
import { Printer, Usb, AlertCircle, Bluetooth, X, BluetoothConnected } from "lucide-react";
import { thermalPrinter } from "@/lib/thermalPrinter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any | null;
}

export function PrintTicketModal({ isOpen, onClose, data }: Props) {
    const { magasin } = useMagasin();
    const [isConnectingUsb, setIsConnectingUsb] = useState(false);
    const [isConnectingBluetooth, setIsConnectingBluetooth] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasPrintedRef = React.useRef(false);

    useEffect(() => {
        if (!isOpen) {
            hasPrintedRef.current = false;
            return;
        }

        let isMounted = true;
        const checkAutoConnect = async () => {
            let currentStatus = thermalPrinter.isConnected();
            
            // Si pas connecté, tente d'auto-reconnecter au dernier périphérique USB
            if (!currentStatus && thermalPrinter.isUsbAvailable()) {
                currentStatus = await thermalPrinter.autoConnectUsb();
            }
            
            if (isMounted) {
                setIsConnected(currentStatus);
                
                // Si l'imprimante est dispo depuis le début (session gardée) -> impression directe !
                if (currentStatus && data && !hasPrintedRef.current) {
                     hasPrintedRef.current = true;
                     executePrint();
                }
            }
        };
        
        checkAutoConnect();
        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const executePrint = async () => {
        setIsPrinting(true);
        setError(null);
        try {
            if (data) {
                await thermalPrinter.printMoomenReceipt(data, magasin);
                toast.success("Impression en cours...");
                setTimeout(() => onClose(), 1000);
            }
        } catch (error: any) {
            console.error('Erreur Impression:', error);
            setError(error.message || 'Erreur lors de l\'impression');
            toast.error("Impossible d'imprimer le ticket");
        } finally {
            setIsPrinting(false);
        }
    };

    const handleConnectUsb = async () => {
        setIsConnectingUsb(true);
        setError(null);
        try {
            await thermalPrinter.connectUsb();
            setIsConnected(true);
            toast.success("Imprimante USB connectée");
        } catch (error: any) {
            console.error('Erreur USB:', error);
            setError(error.message || 'Erreur de connexion USB');
            toast.error("Échec de connexion USB");
        } finally {
            setIsConnectingUsb(false);
        }
    };

    const handleConnectBluetooth = async () => {
        setIsConnectingBluetooth(true);
        setError(null);
        try {
            await thermalPrinter.connect(true);
            setIsConnected(true);
            toast.success("Imprimante Bluetooth connectée");
        } catch (error: any) {
            console.error('Erreur Bluetooth:', error);
            setError(error.message || 'Erreur de connexion Bluetooth');
            toast.error("Échec de connexion Bluetooth");
        } finally {
            setIsConnectingBluetooth(false);
        }
    };

    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                        <Printer className="h-5 w-5" />
                    </div>
                    Impression du ticket
                </div>
            }
            size="md"
            footer={
                <div className="flex justify-between w-full gap-3 bg-white">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-slate-200 font-medium"
                    >
                        <X className="w-4 h-4 mr-2" />
                        <span>Annuler</span>
                    </Button>

                    {!isConnected ? (
                        <div className="flex flex-1 gap-2">
                            <Button
                                onClick={handleConnectBluetooth}
                                disabled={isConnectingBluetooth || isConnectingUsb}
                                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                            >
                                {isConnectingBluetooth ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Bluetooth className="w-4 h-4 mr-2" />
                                        <span>Bluetooth</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleConnectUsb}
                                disabled={isConnectingBluetooth || isConnectingUsb}
                                className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium transition-all"
                            >
                                {isConnectingUsb ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Usb className="w-4 h-4 mr-2" />
                                        <span>USB</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={executePrint}
                            disabled={isPrinting}
                            className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all"
                        >
                            {isPrinting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Impression...
                                </>
                            ) : (
                                <>
                                    <Printer className="w-5 h-5 mr-2" />
                                    Imprimer maintenant
                                </>
                            )}
                        </Button>
                    )}
                </div>
            }
        >
            <div className="p-6">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isConnected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {isConnected ? <BluetoothConnected className="w-8 h-8" /> : <Printer className="w-8 h-8" />}
                    </div>
                    
                    <div className="space-y-2 max-w-sm">
                        <h3 className="text-lg font-bold text-slate-800">
                            {isConnected ? 'Imprimante prête !' : 'Choisissez le mode de connexion'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {isConnected 
                                ? 'Votre imprimante thermique est connectée et prête à imprimer le reçu Moomen.' 
                                : 'Assurez-vous que votre imprimante est allumée. Utilisez Bluetooth ou câble USB pour vous connecter.'}
                        </p>
                    </div>

                    {error && (
                        <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm text-left">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>{error}</div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
