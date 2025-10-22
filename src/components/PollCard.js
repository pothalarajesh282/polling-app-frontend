import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { Delete, HowToVote, BarChart } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deletePoll } from '../store/slices/pollSlice';

const PollCard = ({ poll }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector(state => state.auth);
  
  const totalVotes = poll.totalVotes || poll.options?.reduce((sum, option) => sum + option.voteCount, 0) || 0;
  const hasVoted = localStorage.getItem(`voted_${poll.id}`) === 'true';
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const isAdmin = isLoggedIn && user?.role === 'admin';

  const getUserVotedOption = () => {
    if (!hasVoted) return null;
    const votedOptionId = localStorage.getItem(`voted_option_${poll.id}`);
    return poll.options?.find(option => option.id === parseInt(votedOptionId));
  };

  const userVotedOption = getUserVotedOption();

  const handleViewPoll = () => {
    navigate(`/poll/${poll.id}`);
  };

  const handleDeletePoll = async () => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await dispatch(deletePoll(poll.id)).unwrap();
      } catch (error) {
        alert('Failed to delete poll: ' + error.message);
      }
    }
  };

  const getOptionPercentage = (optionVotes) => {
    if (totalVotes === 0) return 0;
    return (optionVotes / totalVotes) * 100;
  };

  return (
    <Card sx={{ 
      mb: 2, 
      position: 'relative',
      border: hasVoted ? '2px solid' : '1px solid',
      borderColor: hasVoted ? 'success.main' : 'divider',
      boxShadow: hasVoted ? 1 : 0,
      '&:hover': {
        boxShadow: 2,
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out'
      }
    }}>
      
      {/* DELETE BUTTON */}
      {isAdmin && (
        <IconButton 
          onClick={handleDeletePoll}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'error.main',
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'error.main', color: 'white' },
            width: 30,
            height: 30
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
      
      {/* VOTED BADGE */}
      {hasVoted && (
        <Chip 
          icon={<HowToVote sx={{ fontSize: '16px' }} />}
          label="Voted" 
          color="success" 
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}
        />
      )}
      
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* HEADER - Compact */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Typography 
            variant="h6" 
            component="h2" 
            color="text.primary"
            sx={{ 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              lineHeight: 1.3,
              pr: isAdmin ? 4 : 0
            }}
          >
            {poll.question}
          </Typography>
        </Box>

        {/* DESCRIPTION - Only if exists */}
        {poll.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 1.5, fontSize: '0.8rem', lineHeight: 1.2 }}
          >
            {poll.description}
          </Typography>
        )}

        {/* COMPACT RESULTS */}
        <Box sx={{ mb: 2 }}>
          {poll.options?.slice(0, 3).map((option) => {
            const percentage = getOptionPercentage(option.voteCount);
            const isUserChoice = userVotedOption?.id === option.id;
            
            return (
              <Box key={option.id} sx={{ mb: 1 }}>
                {/* Option Row */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.8rem',
                      fontWeight: isUserChoice ? 'bold' : 'normal',
                      color: isUserChoice ? 'success.main' : 'text.primary'
                    }}
                  >
                    {option.text}
                    {isUserChoice && (
                      <Box 
                        component="span" 
                        sx={{ 
                          ml: 0.5, 
                          fontSize: '0.7rem', 
                          color: 'success.main',
                          fontWeight: 'bold'
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: isUserChoice ? 'success.main' : 'primary.main',
                      minWidth: '45px',
                      textAlign: 'right'
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
                
                {/* Progress Bar */}
                <LinearProgress 
                  variant="determinate" 
                  value={percentage} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: isUserChoice ? 'success.main' : 'primary.main',
                      borderRadius: 3
                    }
                  }}
                />
                
                {/* Vote Count */}
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
            );
          })}
          
          {/* Show more options indicator */}
          {poll.options?.length > 3 && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.7rem', display: 'block', textAlign: 'center', mt: 0.5 }}
            >
              +{poll.options.length - 3} more options
            </Typography>
          )}
        </Box>

        {/* COMPACT FOOTER */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              By {poll.user?.username}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.7rem', display: 'block' }}
            >
              {totalVotes} votes
            </Typography>
          </Box>
          
          <Box textAlign="right">
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.7rem', display: 'block' }}
            >
              {poll.createdAt && formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
            </Typography>
            {poll.expiresAt && !isExpired && (
              <Typography 
                variant="caption" 
                color="warning.main"
                sx={{ fontSize: '0.7rem' }}
              >
                {formatDistanceToNow(new Date(poll.expiresAt))} left
              </Typography>
            )}
            {isExpired && (
              <Typography 
                variant="caption" 
                color="error"
                sx={{ fontSize: '0.7rem' }}
              >
                Expired
              </Typography>
            )}
          </Box>
        </Box>

        {/* ACTION BUTTON */}
        <Button 
          variant={hasVoted ? "outlined" : "contained"}
          fullWidth 
          size="small"
          sx={{ 
            mt: 1.5, 
            fontSize: '0.8rem',
            py: 0.5,
            borderColor: hasVoted ? 'success.main' : undefined,
            color: hasVoted ? 'success.main' : undefined
          }}
          onClick={handleViewPoll}
          startIcon={hasVoted ? <HowToVote sx={{ fontSize: '16px' }} /> : <BarChart sx={{ fontSize: '16px' }} />}
        >
          {hasVoted ? 'View Results' : 'Vote Now'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PollCard;