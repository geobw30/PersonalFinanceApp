import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { Edit as EditOutlinedIcon, Delete as DeleteOutlinedIcon, Info as InfoIcon } from '@mui/icons-material';
import type { Category } from '../types';
import { getCategories, createCategory, updateCategory, deleteCategory, isCategoryInUse } from '../api/client';
import { useToast } from '../contexts/ToastContext';

interface CategoryUsage {
  inUse: boolean;
  usageDetails: {
    budgets: number;
    expenses: number;
  };
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryUsages, setCategoryUsages] = useState<Record<number, CategoryUsage>>({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch usage information for all categories
    const fetchCategoryUsages = async () => {
      const usages: Record<number, CategoryUsage> = {};
      for (const category of categories) {
        try {
          const { data } = await isCategoryInUse(category.id);
          usages[category.id] = data;
        } catch (err) {
          console.error(`Failed to fetch usage for category ${category.id}:`, err);
        }
      }
      setCategoryUsages(usages);
    };

    if (categories.length > 0) {
      fetchCategoryUsages();
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newCategory.name.trim()) {
        showToast('Category name is required', 'error');
        return;
      }

      await createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
      showToast('Category created successfully', 'success');
    } catch (error) {
      console.error('Error creating category:', error);
      showToast('Failed to create category', 'error');
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    try {
      await updateCategory(selectedCategory.id, {
        name: selectedCategory.name,
        description: selectedCategory.description
      });
      setEditDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
      showToast('Category updated successfully', 'success');
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('Failed to update category', 'error');
    }
  };

  const handleDeleteClick = async (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      // Check if category is in use
      const usageResponse = await isCategoryInUse(selectedCategory.id);
      if (usageResponse.data.inUse) {
        showToast(
          `Cannot delete category. It is being used by ${usageResponse.data.usageDetails.budgets} budgets and ${usageResponse.data.usageDetails.expenses} expenses.`,
          'error'
        );
        setDeleteDialogOpen(false);
        return;
      }

      await deleteCategory(selectedCategory.id);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const getUsageInfo = (categoryId: number) => {
    const usage = categoryUsages[categoryId];
    if (!usage?.inUse) return null;

    const details = [];
    if (usage.usageDetails.budgets > 0) {
      details.push(`${usage.usageDetails.budgets} budget(s)`);
    }
    if (usage.usageDetails.expenses > 0) {
      details.push(`${usage.usageDetails.expenses} expense(s)`);
    }

    return `Category in use: ${details.join(' and ')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h1">
        Categories
      </Typography>

      {/* Add Category Form */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Category
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            multiline
            rows={2}
            fullWidth
          />
          <Button type="submit" variant="contained" size="small" sx={{ alignSelf: 'flex-start' }}>
            Add Category
          </Button>
        </Box>
      </Paper>

      {/* Categories List */}
      <Paper>
        <List>
          {categories.map((category) => {
            const usageInfo = getUsageInfo(category.id);
            return (
              <ListItem key={category.id} divider>
                <ListItemText
                  primary={category.name}
                  secondary={category.description}
                />
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    edge="end" 
                    aria-label="edit" 
                    onClick={() => {
                      setSelectedCategory(category);
                      setEditDialogOpen(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  {!categoryUsages[category.id]?.inUse && (
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteClick(category)}
                      color="error"
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  )}
                  {usageInfo && (
                    <Tooltip title={usageInfo} arrow>
                      <IconButton size="small" color="info" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Category Name"
              value={selectedCategory?.name || ''}
              onChange={(e) => setSelectedCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={selectedCategory?.description || ''}
              onChange={(e) => setSelectedCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleEdit} variant="contained" size="small">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{selectedCategory?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" size="small">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
} 