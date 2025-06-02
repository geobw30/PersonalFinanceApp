import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { 
  Edit as EditOutlinedIcon, 
  Delete as DeleteOutlinedIcon, 
  Add as AddIcon 
} from '@mui/icons-material';
import { 
  getInvestmentTypes, 
  createInvestmentType, 
  updateInvestmentType, 
  deleteInvestmentType 
} from '../../api/client';
import { useToast } from '../../contexts/ToastContext';
import type { InvestmentType } from '../../types';

interface InvestmentTypeFormData {
  name: string;
  description: string;
}

const InvestmentTypeList: React.FC = () => {
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<InvestmentType | null>(null);
  const [formData, setFormData] = useState<InvestmentTypeFormData>({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchInvestmentTypes = async () => {
    try {
      const response = await getInvestmentTypes();
      setInvestmentTypes(response.data);
    } catch (error) {
      console.error('Error fetching investment types:', error);
      showToast('Failed to fetch investment types', 'error');
    }
  };

  useEffect(() => {
    fetchInvestmentTypes();
  }, []);

  const handleOpen = (investmentType?: InvestmentType) => {
    if (investmentType) {
      setFormData({ name: investmentType.name, description: investmentType.description || '' });
      setEditingId(investmentType.id);
    } else {
      setFormData({ name: '', description: '' });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateInvestmentType(editingId, formData);
        showToast('Investment type updated successfully');
      } else {
        await createInvestmentType(formData);
        showToast('Investment type created successfully');
      }
      handleClose();
      await fetchInvestmentTypes();
    } catch (error) {
      console.error('Error saving investment type:', error);
      showToast('Failed to save investment type', 'error');
    }
  };

  const handleDeleteClick = (investmentType: InvestmentType) => {
    setSelectedForDelete(investmentType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedForDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedForDelete) {
      try {
        await deleteInvestmentType(selectedForDelete.id);
        await fetchInvestmentTypes();
        setDeleteDialogOpen(false);
        setSelectedForDelete(null);
        showToast('Investment type deleted successfully');
      } catch (error) {
        console.error('Error deleting investment type:', error);
        showToast('Failed to delete investment type', 'error');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Investment Types</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Investment Type
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {investmentTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.description}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(type)} size="small">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(type)} size="small">
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? 'Edit Investment Type' : 'Add Investment Type'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the investment type "{selectedForDelete?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestmentTypeList; 