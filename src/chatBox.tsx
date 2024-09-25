// src/chatBox.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface InputRowProps {
  onSendPress: (text: string) => void;
  loading: boolean;
  // onEmojiPress: () => void;
  questions: string[];
}

interface QuestionButtonProps {
  question: string;
  index: number;
  onQuestionPress: (question: string) => void;
}

const QuestionButton: React.FC<QuestionButtonProps> = ({
  question,
  index,
  onQuestionPress,
}) => {
  const colors = ['0E2391', '536FFF', '7587EC', 'AAB3E6', '999CAC'];
  const backgroundColor = `#${colors[index % colors.length]}`;
  const questionButtonStyle = {
    borderRadius: 40,
    margin: 3,
    marginBottom: 5,
    backgroundColor,
  };

  return (
    <TouchableOpacity
      onPress={() => onQuestionPress(question)}
      style={questionButtonStyle}
    >
      <Text style={styles.questionButtonText}>{question}</Text>
    </TouchableOpacity>
  );
};

const InputRow: React.FC<InputRowProps> = ({
  onSendPress,
  loading,
  // onEmojiPress,
  questions,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const handleSendPress = () => {
    onSendPress(text);
    setText('');
  };

  const handleQuestionPress = (question: string) => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
    setText(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.bottomRow}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.questionButtonsContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.questionButtonsRow}>
            {questions.map((question, index) => (
              <QuestionButton
                key={index}
                question={question}
                index={index}
                onQuestionPress={handleQuestionPress}
              />
            ))}
          </View>
        </ScrollView>
        <View style={styles.textInput}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
            placeholderTextColor={'gray' + '30'}
            value={text}
            onChangeText={setText}
            ref={inputRef}
          />

          <TouchableOpacity onPress={handleSendPress} style={styles.sendButton}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={onEmojiPress} style={styles.emojiButton}>
            <Text style={styles.emojiText}>💰</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#40404099',
    borderRadius: 50,
    paddingHorizontal: 15,
    marginLeft: 20,
    marginBottom: 30,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    color: 'white',
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 30,
    backgroundColor: '#40404080',
    alignSelf: 'flex-end',
    marginHorizontal: 10,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#40404090',
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  emojiText: {
    fontSize: 20,
    marginRight: 3,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    paddingTop: 15,
  },
  textInput: {
    flexDirection: 'row',
    bottom: 0,
    width: '100%',
    zIndex: 4,
    overflow: 'hidden',
    backgroundColor: '#12121275',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingTop: 15,
  },
  questionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 5,
  },
  questionButtonsContainer: {
    flex: 1,
  },
  questionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  sendIcon: {
    fontSize: 20,
    color: 'white',
  },
});

export default InputRow;
