import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  text: "Welcome to Discord Text Generator!",
  fgColor: "#ffffff",
  bgColor: "#36393f",
  currentFgColor: "#ffffff",
  currentBgColor: "#36393f",
  currentBold: false, // New
  currentUnderline: false, // New
  selections: [],
};

export const textSlice = createSlice({
  name: "text",
  initialState,
  reducers: {
    setText: (state, action) => {
      state.text = action.payload;
    },
    setFgColor: (state, action) => {
      state.fgColor = action.payload;
    },
    setBgColor: (state, action) => {
      state.bgColor = action.payload;
    },
    setCurrentFgColor: (state, action) => {
      state.currentFgColor = action.payload;
    },
    setCurrentBgColor: (state, action) => {
      state.currentBgColor = action.payload;
    },
    setCurrentBold: (state, action) => {
      // New
      state.currentBold = action.payload;
    },
    setCurrentUnderline: (state, action) => {
      // New
      state.currentUnderline = action.payload;
    },
    addSelection: (state, action) => {
      const newSelection = {
        ...action.payload,
        // Default to current styles if not specified
        bold:
          action.payload.bold !== undefined
            ? action.payload.bold
            : state.currentBold,
        underline:
          action.payload.underline !== undefined
            ? action.payload.underline
            : state.currentUnderline,
      };

      // Remove any selections that overlap with the new selection
      state.selections = state.selections.filter((selection) => {
        const noOverlap =
          newSelection.end <= selection.start ||
          newSelection.start >= selection.end;
        const notSame = !(
          newSelection.start === selection.start &&
          newSelection.end === selection.end
        );
        return noOverlap || !notSame;
      });

      // Update existing selection if it matches exactly
      const existingIndex = state.selections.findIndex(
        (s) => s.start === newSelection.start && s.end === newSelection.end
      );

      if (existingIndex !== -1) {
        state.selections[existingIndex] = {
          ...state.selections[existingIndex],
          ...newSelection,
        };
      } else {
        state.selections.push(newSelection);
      }

      // Sort selections by start position
      state.selections.sort((a, b) => a.start - b.start);
    },
    removeSelection: (state, action) => {
      state.selections = state.selections.filter(
        (_, index) => index !== action.payload
      );
    },
    clearSelections: (state) => {
      state.selections = [];
    },
    clearColors: (state) => {
      state.fgColor = "#ffffff";
      state.bgColor = "#36393f";
      state.currentFgColor = "#ffffff";
      state.currentBgColor = "#36393f";
      state.currentBold = false; // New
      state.currentUnderline = false; // New
      state.selections = [];
    },
  },
});

export const {
  setText,
  setFgColor,
  setBgColor,
  addSelection,
  removeSelection,
  clearSelections,
  clearColors,
  setCurrentFgColor,
  setCurrentBgColor,
  setCurrentBold, // New
  setCurrentUnderline, // New
} = textSlice.actions;

export default textSlice.reducer;
