import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '../stores/notification.store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const CreateNotificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [urgency, setUrgency] = useState<1 | 2 | 3>(2);
  const [titleError, setTitleError] = useState('');
  const [bodyError, setBodyError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { createNotification, error: storeError } = useNotificationStore();

  const validateForm = (): boolean => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!body.trim()) {
      setBodyError('Body is required');
      isValid = false;
    } else {
      setBodyError('');
    }

    return isValid;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await createNotification({
        title: title.trim(),
        body: body.trim(),
        urgency,
      });
      Alert.alert('Success', 'Notification created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Notification</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>

          <Input
            label="Title"
            placeholder="Enter notification title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError('');
            }}
            error={titleError}
            maxLength={100}
          />

          <Input
            label="Body"
            placeholder="Enter notification body"
            value={body}
            onChangeText={(text) => {
              setBody(text);
              if (bodyError) setBodyError('');
            }}
            error={bodyError}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            maxLength={500}
          />

          <View style={styles.urgencyContainer}>
            <Text style={styles.urgencyLabel}>Urgency Level</Text>
            <View style={styles.urgencyButtons}>
              {[1, 2, 3].map((level) => {
                const isActive = urgency === level;
                const buttonStyle: ViewStyle = isActive
                  ? { ...styles.urgencyButton, ...styles.urgencyButtonActive }
                  : styles.urgencyButton;
                return (
                  <Button
                    key={level}
                    title={level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'}
                    onPress={() => setUrgency(level as 1 | 2 | 3)}
                    variant={isActive ? 'primary' : 'secondary'}
                    style={buttonStyle}
                  />
                );
              })}
            </View>
          </View>

          {storeError && <Text style={styles.errorText}>{storeError}</Text>}

          <Button
            title="Create Notification"
            onPress={handleCreate}
            loading={isLoading}
            style={styles.button}
          />

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  urgencyContainer: {
    marginBottom: 24,
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
  },
  urgencyButtonActive: {
    opacity: 1,
  },
  button: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
});

