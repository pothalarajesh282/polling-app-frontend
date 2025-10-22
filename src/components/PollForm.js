import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Chip
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { createPoll } from '../store/slices/pollSlice';

const PollForm = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector(state => state.polls);
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', ''],
    expiresAt: ''
  });

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const pollData = {
    question: formData.question,
    description: formData.description,
    options: formData.options.filter(option => option.trim() !== ''),
    expiresAt: formData.expiresAt || null  // Ensure null instead of empty string
  };

  if (pollData.options.length < 2) {
    alert('Please add at least 2 options');
    return;
  }

  try {
    await dispatch(createPoll(pollData)).unwrap();
    handleClose();
  } catch (error) {
    console.error('Failed to create poll:', error);
  }
};

  const handleClose = () => {
    setFormData({
      question: '',
      description: '',
      options: ['', ''],
      expiresAt: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Poll</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Poll Question"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Options ({formData.options.length})
          </Typography>
          
          {formData.options.map((option, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
              <TextField
                label={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                fullWidth
                required
              />
              {formData.options.length > 2 && (
                <IconButton 
                  onClick={() => handleRemoveOption(index)}
                  color="error"
                  size="small"
                >
                  <Remove />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<Add />}
            onClick={handleAddOption}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Add Option
          </Button>

          <TextField
            margin="dense"
            label="Expiration Date (Optional)"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.expiresAt}
            onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PollForm;