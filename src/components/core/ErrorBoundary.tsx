import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/src/constants/design-tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Something went wrong
          </ThemedText>
          <ThemedText style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </ThemedText>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    backgroundColor: Colors.light.status.info,
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.light.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

