import { Plus, X, Check, Trash2 } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8;

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
    });
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        id: tasks.length + 1,
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
      },
    ]);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isModalVisible]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="h-full flex-1 items-center justify-start bg-white p-4">
        <Text className="mb-6 text-center text-2xl font-bold">Task List</Text>
        <ScrollView className="w-full flex-1">
          {tasks.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-400">No tasks yet. Add one to get started!</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <View
                key={task.id}
                className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <TouchableOpacity
                  className="flex-row items-start space-x-3"
                  onPress={() => toggleTask(task.id)}>
                  <View
                    className={`mr-2 mt-1 h-6 w-6 items-center justify-center self-center rounded-full border-2 ${
                      task.completed ? 'border-ten bg-ten' : 'border-gray-300'
                    }`}>
                    {task.completed && <Check size={16} color="white" />}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-lg font-medium ${
                        task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                      }`}>
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text
                        className={`mt-1 ${
                          task.completed ? 'text-gray-400 line-through' : 'text-gray-600'
                        }`}>
                        {task.description}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    className="ml-2 flex self-center"
                    onPress={() => deleteTask(task.id)}>
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          className="bg-ten absolute bottom-4 right-10 rounded-full p-5"
          onPress={showModal}>
          <Plus size={24} color="white" />
        </TouchableOpacity>

        <Modal visible={isModalVisible} transparent onRequestClose={hideModal} animationType="none">
          <TouchableWithoutFeedback onPress={hideModal}>
            <Animated.View className="flex-1 bg-black/50" style={{ opacity: fadeAnim }}>
              <TouchableWithoutFeedback>
                <Animated.View
                  className="absolute bottom-0 w-full rounded-t-3xl bg-white p-6"
                  style={[
                    {
                      height: MODAL_HEIGHT,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold">Add New Task</Text>
                    <TouchableOpacity onPress={hideModal}>
                      <X size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 pt-6">
                    <TextInput
                      className="mb-4 rounded-lg border border-gray-300 p-3"
                      placeholder="Title"
                      value={newTaskTitle}
                      onChangeText={setNewTaskTitle}
                    />
                    <TextInput
                      className="rounded-lg border border-gray-300 p-3"
                      placeholder="Description"
                      value={newTaskDescription}
                      onChangeText={setNewTaskDescription}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      className="bg-ten mt-6 rounded-lg p-4"
                      onPress={() => {
                        addTask();
                        hideModal();
                      }}>
                      <Text className="text-center font-semibold text-white">Add Task</Text>
                    </TouchableOpacity>
                  </KeyboardAvoidingView>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
