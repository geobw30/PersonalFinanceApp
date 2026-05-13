import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import {
  Edit as EditOutlinedIcon,
  Delete as DeleteOutlinedIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  getCategories,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../api/client";
import { useToast } from "../../contexts/ToastContext";
import type { Category, SubCategory } from "../../types";

interface SubCategoryFormData {
  categoryId: number | "";
  name: string;
  description: string;
}

const emptyForm: SubCategoryFormData = {
  categoryId: "",
  name: "",
  description: "",
};

const SubCategoryList: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<number | "">("");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] =
    useState<SubCategory | null>(null);
  const [formData, setFormData] = useState<SubCategoryFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [scRes, catRes] = await Promise.all([
        getSubCategories(),
        getCategories(),
      ]);
      setSubCategories(scRes.data);
      setCategories(catRes.data);
    } catch {
      showToast("Failed to load subcategories", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (sc?: SubCategory) => {
    if (sc) {
      setFormData({
        categoryId: sc.categoryId,
        name: sc.name,
        description: sc.description || "",
      });
      setEditingId(sc.id);
    } else {
      setFormData(emptyForm);
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return;
    try {
      if (editingId) {
        await updateSubCategory(editingId, {
          name: formData.name,
          description: formData.description || undefined,
        });
        showToast("Sub category updated successfully");
      } else {
        await createSubCategory({
          categoryId: formData.categoryId as number,
          name: formData.name,
          description: formData.description || undefined,
        });
        showToast("Sub category created successfully");
      }
      handleClose();
      await fetchData();
    } catch {
      showToast("Failed to save sub category", "error");
    }
  };

  const handleDeleteClick = (sc: SubCategory) => {
    setSelectedForDelete(sc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedForDelete) return;
    try {
      await deleteSubCategory(selectedForDelete.id);
      setDeleteDialogOpen(false);
      setSelectedForDelete(null);
      showToast("Sub category deleted successfully");
      await fetchData();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to delete sub category";
      showToast(msg, "error");
    }
  };

  const displayed = filterCategoryId
    ? subCategories.filter((sc) => sc.categoryId === filterCategoryId)
    : subCategories;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Sub Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Sub Category
        </Button>
      </Box>

      {/* Filter by category */}
      <FormControl size="small" sx={{ mb: 2, minWidth: 220 }}>
        <InputLabel>Filter by Category</InputLabel>
        <Select
          value={filterCategoryId}
          label="Filter by Category"
          onChange={(e) => setFilterCategoryId(e.target.value as number | "")}
        >
          <MenuItem value="">
            <em>All Categories</em>
          </MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ color: "text.secondary", py: 4 }}
                >
                  No sub categories found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((sc) => (
                <TableRow key={sc.id}>
                  <TableCell>{sc.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={sc.categoryName}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{sc.description}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(sc)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(sc)}
                      size="small"
                      color="error"
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? "Edit Sub Category" : "Add Sub Category"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
          >
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                label="Category"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: e.target.value as number,
                  })
                }
                disabled={!!editingId}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the sub category "
            {selectedForDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubCategoryList;
