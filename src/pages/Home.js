import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  CircularProgress
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPolls } from '../store/slices/pollSlice';
import PollCard from '../components/PollCard';
import PollForm from '../components/PollForm';

const Home = () => {
  const dispatch = useDispatch();
  const { polls, isLoading, totalPages, currentPage, totalPolls } = useSelector(state => state.polls);
  const { isLoggedIn, user } = useSelector(state => state.auth);
  
  const [viewMode, setViewMode] = useState('active');
  const [page, setPage] = useState(1);
  const [isPollFormOpen, setIsPollFormOpen] = useState(false);

  useEffect(() => {
    loadPolls();
  }, [viewMode, page]);

  const loadPolls = () => {
    dispatch(fetchPolls({ 
      page, 
      limit: 9,
      active: viewMode === 'active'
    }));
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      setPage(1);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Polling App
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {polls.length} polls available • Create and participate in polls
          </Typography>
        </Box>
        
        {isLoggedIn && user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsPollFormOpen(true)}
          >
            Create Poll
          </Button>
        )}
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
        >
          <ToggleButton value="active" aria-label="active polls">
            Active Polls
          </ToggleButton>
          <ToggleButton value="all" aria-label="all polls">
            All Polls
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {polls.map((poll) => (
              <Grid item xs={12} sm={6} md={4} key={poll.id}>
                <PollCard poll={poll} />
              </Grid>
            ))}
          </Grid>

          {polls.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                No polls found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {viewMode === 'active' 
                  ? 'There are no active polls at the moment.' 
                  : 'No polls have been created yet.'}
              </Typography>
            </Box>
          )}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <PollForm 
        open={isPollFormOpen} 
        onClose={() => setIsPollFormOpen(false)} 
      />
    </Container>
  );
};

export default Home;