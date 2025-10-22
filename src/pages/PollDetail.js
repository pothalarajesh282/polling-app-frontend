import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { fetchPollById, vote, updatePollFromSocket } from '../store/slices/pollSlice';
import socketService from '../services/socketService';

const PollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPoll, isLoading, error } = useSelector(state => state.polls);
  const { isLoggedIn } = useSelector(state => state.auth);
  
  const [selectedOption, setSelectedOption] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    dispatch(fetchPollById(id));
    
    // Setup socket connection for real-time updates
    socketService.connect();
    socketService.joinPoll(id);
    
    socketService.onVoteUpdate((updatedPoll) => {
      dispatch(updatePollFromSocket(updatedPoll));
    });

    return () => {
      socketService.leavePoll(id);
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentPoll) {
      // Check if user has already voted (this would typically come from the backend)
      const voted = localStorage.getItem(`voted_${id}`);
      setHasVoted(!!voted);
      setShowResults(!!voted);
    }
  }, [currentPoll, id]);

 // In the vote function in PollDetail.js
const handleVote = async () => {
  if (!selectedOption) return;

  try {
    await dispatch(vote({ pollId: id, optionId: parseInt(selectedOption) })).unwrap();
    
    // Set both vote status and which option was voted for
    localStorage.setItem(`voted_${id}`, 'true');
    localStorage.setItem(`voted_option_${id}`, selectedOption);
    
    setHasVoted(true);
    setShowResults(true);
    
    // Force refresh to update home page
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
    
  } catch (error) {
    console.error('Failed to vote:', error);
  }
};

  const totalVotes = currentPoll?.options?.reduce((sum, option) => sum + option.voteCount, 0) || 0;
  const isExpired = currentPoll?.expiresAt && new Date(currentPoll.expiresAt) < new Date();

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.error || 'Failed to load poll'}
        </Alert>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }

  if (!currentPoll) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Poll not found</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
        ← Back to Polls
      </Button>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentPoll.question}
            </Typography>
            <Box textAlign="right">
              {isExpired && (
                <Chip label="Expired" color="error" sx={{ mb: 1 }} />
              )}
              <Typography variant="body2" color="text.secondary">
                {totalVotes} total votes
              </Typography>
            </Box>
          </Box>

          {currentPoll.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {currentPoll.description}
            </Typography>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="body2" color="text.secondary">
              Created by {currentPoll.user?.username}
            </Typography>
            <Box textAlign="right">
              <Typography variant="body2" display="block" color="text.secondary">
                Created {formatDistanceToNow(new Date(currentPoll.createdAt), { addSuffix: true })}
              </Typography>
              {currentPoll.expiresAt && (
                <Typography 
                  variant="body2" 
                  color={isExpired ? 'error' : 'text.secondary'}
                >
                  {isExpired 
                    ? 'Expired' 
                    : `Expires ${formatDistanceToNow(new Date(currentPoll.expiresAt))}`
                  }
                </Typography>
              )}
            </Box>
          </Box>

          {!showResults && !hasVoted && !isExpired ? (
            <>
              <RadioGroup
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                sx={{ mb: 3 }}
              >
                {currentPoll.options?.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id.toString()}
                    control={<Radio />}
                    label={option.text}
                    sx={{
                      mb: 1,
                      p: 1,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'grey.50'
                      }
                    }}
                  />
                ))}
              </RadioGroup>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleVote}
                disabled={!selectedOption}
              >
                Submit Vote
              </Button>
            </>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Poll Results
              </Typography>
              
              {currentPoll.options?.map((option) => {
                const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
                return (
                  <Box key={option.id} sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {option.text}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {option.voteCount} votes ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        bgcolor: 'grey.200'
                      }}
                    />
                  </Box>
                );
              })}

              {hasVoted && !isExpired && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Thank you for voting! Your vote has been recorded.
                </Alert>
              )}

              {isExpired && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This poll has ended. Voting is no longer available.
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PollDetail;