import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";

import { useState } from "react";

export const Delete = ({
    isOpen,
    onClose,
    client,
    onSuccess,
    size
  }: {
    isOpen: boolean;
    onClose: () => void;
    client: any;
    onSuccess: () => void;
      size?: "sm" | "md" | "lg" | "xl" | "full";
  }) => {
    const [isDeleting, setIsDeleting] = useState(false);
  
    const handleDelete = async () => {
     try {
            
      setIsDeleting(true);
             await apiFetch("/client/"+client.id, {
               data:{} ,
               provenance: true,
               method: "DELETE",
             }).then((res) => {
              setIsDeleting(false);
       
               onSuccess();
               onClose();
             })
               .catch((err) => {
                 console.error(err.message);
                 setIsDeleting(false);
               onClose();
       
               });
       
           } catch (error) {
             console.error("Error creating regulator:", error);
             setIsDeleting(true);
             onClose();
           }
    };
  
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Confirm Deletion"
        size={size}
        footer={
          <>
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{client.nom}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    );
  };