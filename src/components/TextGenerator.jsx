import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Button,
  Text,
  Stack,
  Paper,
  ColorPicker,
  Title,
  Card,
  Grid,
  Textarea,
  Checkbox,
  Group,
} from "@mantine/core";
import {
  setText,
  setFgColor,
  setBgColor,
  addSelection,
  clearSelections,
  clearColors,
  setCurrentFgColor,
  setCurrentBgColor,
  setCurrentUnderline,
  setCurrentBold,
} from "../store/textSlice";
import { useRef, useEffect } from "react";
import ansi from "ansi-colors";

// Enable ANSI colors
ansi.enabled = true;

function TextGenerator() {
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const {
    text,
    fgColor,
    bgColor,
    currentFgColor,
    currentBgColor,
    currentUnderline,
    currentBold,
    selections,
  } = useSelector((state) => state.text);

  const handleTextSelection = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    const newSelection = {
      start,
      end,
      fgColor:
        type === "fg"
          ? currentFgColor
          : selections.find((s) => s.start === start && s.end === end)
              ?.fgColor || fgColor,
      bgColor:
        type === "bg"
          ? currentBgColor
          : selections.find((s) => s.start === start && s.end === end)
              ?.bgColor || bgColor,
      underline: currentUnderline,
      bold: currentBold,
    };

    dispatch(addSelection(newSelection));
  };

  const generateColoredText = () => {
    if (!text) return "";
    if (selections.length === 0) {
      return `[color=${fgColor}][bg=${bgColor}]${text}[/bg][/color]`;
    }

    let result = "";
    let lastIndex = 0;

    const sortedSelections = [...selections].sort((a, b) => a.start - b.start);

    sortedSelections.forEach((selection) => {
      if (lastIndex < selection.start) {
        const defaultText = text.substring(lastIndex, selection.start);
        result += `[color=${fgColor}][bg=${bgColor}]${defaultText}[/bg][/color]`;
      }

      const selectedText = text.substring(selection.start, selection.end);
      let formattedText = selectedText;
      if (selection.underline) formattedText = `[u]${formattedText}[/u]`;
      if (selection.bold) formattedText = `[b]${formattedText}[/b]`;

      result += `[color=${selection.fgColor}][bg=${selection.bgColor}]${formattedText}[/bg][/color]`;

      lastIndex = selection.end;
    });

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      result += `[color=${fgColor}][bg=${bgColor}]${remainingText}[/bg][/color]`;
    }

    return result;
  };

  const generateAnsiText = () => {
    if (!text) return "ansi\n";

    let ansiText = "ansi\n";
    let lastIndex = 0;

    // If no selections, use default styles for entire text
    if (selections.length === 0) {
      let style = ansi.hex(fgColor).bgHex(bgColor);
      if (currentBold) style = style.bold;
      if (currentUnderline) style = style.underline;
      return `ansi\n${style(text)}`;
    }

    // Sort selections by start position
    const sortedSelections = [...selections].sort((a, b) => a.start - b.start);

    // Track current styles
    let currentFg = fgColor;
    let currentBg = bgColor;
    let currentUnderline = false;
    let currentBold = false;
    let currentStyle = ansi.hex(currentFg).bgHex(currentBg);

    sortedSelections.forEach((selection) => {
      // Add text before selection
      if (lastIndex < selection.start) {
        const segment = text.substring(lastIndex, selection.start);
        if (
          currentFg !== fgColor ||
          currentBg !== bgColor ||
          currentUnderline !== false ||
          currentBold !== false
        ) {
          currentFg = fgColor;
          currentBg = bgColor;
          currentUnderline = false;
          currentBold = false;
          currentStyle = ansi.hex(currentFg).bgHex(currentBg);
        }
        ansiText += currentStyle(segment);
      }

      // Add selected text
      const segment = text.substring(selection.start, selection.end);
      if (
        currentFg !== selection.fgColor ||
        currentBg !== selection.bgColor ||
        currentUnderline !== selection.underline ||
        currentBold !== selection.bold
      ) {
        currentFg = selection.fgColor;
        currentBg = selection.bgColor;
        currentUnderline = selection.underline;
        currentBold = selection.bold;

        currentStyle = ansi.hex(currentFg).bgHex(currentBg);
        if (currentBold) currentStyle = currentStyle.bold;
        if (currentUnderline) currentStyle = currentStyle.underline;
      }
      ansiText += currentStyle(segment);

      lastIndex = selection.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      const segment = text.substring(lastIndex);
      if (
        currentFg !== fgColor ||
        currentBg !== bgColor ||
        currentUnderline !== false ||
        currentBold !== false
      ) {
        currentStyle = ansi.hex(fgColor).bgHex(bgColor);
      }
      ansiText += currentStyle(segment);
    }

    return ansiText;
  };

  const copyToClipboard = () => {
    const ansiText = generateAnsiText();
    navigator.clipboard
      .writeText(ansiText)
      .then(() => {
        console.log("Copied to clipboard successfully!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Copying failed. Try copying manually:\n\n" + ansiText);
      });
  };

  const renderPreviewText = () => {
    if (!text) return null;
    if (selections.length === 0) {
      return (
        <span
          style={{
            color: fgColor,
            backgroundColor: bgColor,
            padding: "2px 4px",
            borderRadius: "3px",
            display: "inline-block",
            lineHeight: "1.5",
            fontWeight: currentBold ? "bold" : "normal",
            textDecoration: currentUnderline ? "underline" : "none",
          }}
        >
          {text}
        </span>
      );
    }

    let elements = [];
    let lastIndex = 0;

    const sortedSelections = [...selections].sort((a, b) => a.start - b.start);

    sortedSelections.forEach((selection, index) => {
      if (lastIndex < selection.start) {
        const defaultText = text.substring(lastIndex, selection.start);
        if (defaultText) {
          elements.push(
            <span
              key={`text-${index}`}
              style={{
                color: fgColor,
                backgroundColor: bgColor,
                padding: "2px 4px",
                borderRadius: "3px",
                display: "inline-block",
                lineHeight: "1.5",
                fontWeight: "normal",
                textDecoration: "none",
              }}
            >
              {defaultText}
            </span>
          );
        }
      }

      const selectedText = text.substring(selection.start, selection.end);
      if (selectedText) {
        elements.push(
          <span
            key={`selection-${index}`}
            style={{
              color: selection.fgColor,
              backgroundColor: selection.bgColor,
              padding: "2px 4px",
              borderRadius: "3px",
              display: "inline-block",
              lineHeight: "1.5",
              fontWeight: selection.bold ? "bold" : "normal",
              textDecoration: selection.underline ? "underline" : "none",
            }}
          >
            {selectedText}
          </span>
        );
      }

      lastIndex = selection.end;
    });

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        elements.push(
          <span
            key="text-end"
            style={{
              color: fgColor,
              backgroundColor: bgColor,
              padding: "2px 4px",
              borderRadius: "3px",
              display: "inline-block",
              lineHeight: "1.5",
              fontWeight: "normal",
              textDecoration: "none",
            }}
          >
            {remainingText}
          </span>
        );
      }
    }

    return elements;
  };

  useEffect(() => {
    const validSelections = selections.filter(
      (selection) =>
        selection.start <= text.length && selection.end <= text.length
    );

    if (validSelections.length !== selections.length) {
      dispatch(clearSelections());
    }
  }, [text, dispatch]);

  return (
    <Container
      size="lg"
      py="xl"
      style={{ backgroundColor: "#36393f", minHeight: "100vh" }}
    >
      <Stack spacing="lg">
        <Title order={1} align="center" c="white">
          Discord Text Generator
        </Title>

        <Card withBorder bg="#2f3136">
          <Stack>
            <Textarea
              label="Enter your text"
              value={text}
              onChange={(e) => dispatch(setText(e.target.value))}
              placeholder="Type something..."
              minRows={3}
              ref={textareaRef}
              styles={{
                label: { color: "white" },
                input: {
                  backgroundColor: "#40444b",
                  color: "white",
                  border: "none",
                  fontSize: "16px",
                  lineHeight: "1.5",
                },
              }}
            />
          </Stack>
        </Card>

        <Grid>
          <Grid.Col span={6}>
            <Card withBorder bg="#2f3136">
              <Stack>
                <Text c="white" size="sm" weight={500}>
                  Text Color
                </Text>
                <ColorPicker
                  format="hex"
                  value={currentFgColor}
                  onChange={(color) => dispatch(setCurrentFgColor(color))}
                  fullWidth
                  styles={{
                    preview: { borderColor: "#666" },
                  }}
                />
                <Group>
                  <Checkbox
                    label="Bold"
                    checked={currentBold}
                    onChange={(e) =>
                      dispatch(setCurrentBold(e.currentTarget.checked))
                    }
                    styles={{
                      label: { color: "white" },
                    }}
                  />
                  <Checkbox
                    label="Underline"
                    checked={currentUnderline}
                    onChange={(e) =>
                      dispatch(setCurrentUnderline(e.currentTarget.checked))
                    }
                    styles={{
                      label: { color: "white" },
                    }}
                  />
                </Group>
                <Button
                  onClick={() => handleTextSelection("fg")}
                  fullWidth
                  variant="filled"
                  color="blue"
                >
                  Apply to Selection
                </Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder bg="#2f3136">
              <Stack>
                <Text c="white" size="sm" weight={500}>
                  Background Color
                </Text>
                <ColorPicker
                  format="hex"
                  value={currentBgColor}
                  onChange={(color) => dispatch(setCurrentBgColor(color))}
                  fullWidth
                  styles={{
                    preview: { borderColor: "#666" },
                  }}
                />
                <Button
                  onClick={() => handleTextSelection("bg")}
                  fullWidth
                  variant="filled"
                  color="blue"
                >
                  Apply to Selection
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {selections.length > 0 && (
          <Button
            variant="subtle"
            color="red"
            onClick={() => dispatch(clearSelections())}
            fullWidth
          >
            Clear Selections
          </Button>
        )}

        <Button
          variant="subtle"
          color="red"
          onClick={() => dispatch(clearColors())}
          fullWidth
        >
          Reset All Colors
        </Button>

        <Paper withBorder p="md" bg="#2f3136">
          <Text c="white" size="sm" weight={500} mb="xs">
            Preview:
          </Text>
          <Paper
            ref={previewRef}
            p="md"
            style={{
              backgroundColor: "#40444b",
              wordBreak: "break-word",
              color: "white",
              minHeight: "50px",
            }}
          >
            {renderPreviewText()}
          </Paper>

          <Button color="blue" onClick={copyToClipboard} fullWidth mt="md">
            Copy to Discord
          </Button>
        </Paper>
      </Stack>
    </Container>
  );
}

export default TextGenerator;
