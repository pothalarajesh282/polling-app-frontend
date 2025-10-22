import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pollService from '../../services/pollService';

// All async thunks
export const fetchPolls = createAsyncThunk(
  'polls/fetchPolls',
  async (params, { rejectWithValue }) => {
    try {
      const response = await pollService.getPolls(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPollById = createAsyncThunk(
  'polls/fetchPollById',
  async (pollId, { rejectWithValue }) => {
    try {
      const response = await pollService.getPollById(pollId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPoll = createAsyncThunk(
  'polls/createPoll',
  async (pollData, { rejectWithValue }) => {
    try {
      const response = await pollService.createPoll(pollData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ADD THIS - Vote async thunk
export const vote = createAsyncThunk(
  'polls/vote',
  async ({ pollId, optionId }, { rejectWithValue }) => {
    try {
      const response = await pollService.vote(pollId, optionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ADD THIS - Delete poll async thunk
export const deletePoll = createAsyncThunk(
  'polls/deletePoll',
  async (pollId, { rejectWithValue }) => {
    try {
      const response = await pollService.deletePoll(pollId);
      
      // Clean up local storage for this poll
      localStorage.removeItem(`voted_${pollId}`);
      localStorage.removeItem(`voted_option_${pollId}`);
      
      return { pollId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const pollSlice = createSlice({
  name: 'polls',
  initialState: {
    polls: [],
    currentPoll: null,
    isLoading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalPolls: 0
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPoll: (state) => {
      state.currentPoll = null;
    },
    updatePollFromSocket: (state, action) => {
      const updatedPoll = action.payload;
      const index = state.polls.findIndex(poll => poll.id === updatedPoll.id);
      if (index !== -1) {
        state.polls[index] = updatedPoll;
      }
      if (state.currentPoll && state.currentPoll.id === updatedPoll.id) {
        state.currentPoll = updatedPoll;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch polls
      .addCase(fetchPolls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.polls = action.payload.polls;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalPolls = action.payload.totalPolls;
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch poll by ID
      .addCase(fetchPollById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPollById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPoll = action.payload;
      })
      .addCase(fetchPollById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create poll
      .addCase(createPoll.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.isLoading = false;
        state.polls.unshift(action.payload.poll);
        state.totalPolls += 1;
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Vote
      .addCase(vote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(vote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPoll = action.payload.poll;
        
        // Update poll in polls list
        const index = state.polls.findIndex(poll => poll.id === action.payload.poll.id);
        if (index !== -1) {
          state.polls[index] = action.payload.poll;
        }
      })
      .addCase(vote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete poll
      .addCase(deletePoll.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePoll.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the deleted poll from the polls array
        state.polls = state.polls.filter(poll => poll.id !== action.payload.pollId);
        state.totalPolls -= 1;
      })
      .addCase(deletePoll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentPoll, updatePollFromSocket } = pollSlice.actions;
export default pollSlice.reducer;