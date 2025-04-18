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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import uuid from 'react-native-uuid';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8;

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    // {
    //   id: uuid.v4(),
    //   title: 'Task 1',
    //   description: 'Description 1',
    //   completed: false,
    // },
    // {
    //   id: uuid.v4(),
    //   title: 'Task 2',
    //   description: 'Description 2',
    //   completed: false,
    // },
    // {
    //   id: uuid.v4(),
    //   title: 'Task 3',
    //   description: 'Description 3',
    //   completed: false,
    // },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swipeableRefs = useRef(new Map()).current; //url: https://github.com/software-mansion/react-native-gesture-handler/issues/764#issuecomment-635552081

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
        id: uuid.v4(),
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
      },
    ]);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id: string) => {
    console.log('deleteTask', id);
    const taskToDelete = tasks.find((task) => task.id === id);
    if (taskToDelete) {
      setTasks(tasks.filter((task) => task.id !== id));
      Toast.show({
        type: 'info',
        position: 'bottom',
        text1: 'Task deleted',
        text2: 'Tap to undo',
        onPress: () => {
          setTasks((prevTasks) => [...prevTasks, taskToDelete]);
          Toast.hide();
        },
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 0,
        bottomOffset: 40,
      });
    }
  };

  const closeAllOtherSwipeables = (taskId: string) => {
    [...swipeableRefs.entries()].forEach(([key, ref]) => {
      if (key !== taskId && ref) {
        ref.close();
      }
    });
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

  function LeftAction(prog: SharedValue<number>, drag: SharedValue<number>, taskId: string) {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value - 110 }],
      };
    });

    const task = tasks.find((t) => t.id === taskId);

    return (
      <Reanimated.View style={styleAnimation} className="mb-4 w-[110px]" key={taskId}>
        <TouchableOpacity
          className={`flex h-full w-[100px] items-center justify-center rounded-lg ${
            !task?.completed ? 'bg-gray-300' : 'bg-green-500'
          }`}
          onPress={() => toggleTask(taskId)}>
          {task?.completed ? <Check size={24} color="white" /> : <X size={24} color="white" />}
        </TouchableOpacity>
      </Reanimated.View>
    );
  }

  function RightAction(prog: SharedValue<number>, drag: SharedValue<number>, taskId: string) {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 110 }],
      };
    });

    return (
      <Reanimated.View style={styleAnimation} className="mb-4 w-[110px]" key={taskId}>
        <View className="flex h-full w-[100px] items-center justify-center rounded-lg bg-red-500">
          <Trash2 size={24} color="white" />
        </View>
      </Reanimated.View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="h-full flex-1 items-center justify-start bg-white p-4">
        <Text className="mb-6 text-center text-2xl font-bold">Task List</Text>
        <GestureHandlerRootView className="w-full flex-1">
          <ScrollView className="w-full flex-1">
            {tasks.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-gray-400">No tasks yet. Add one to get started!</Text>
              </View>
            ) : (
              tasks.map((task) => (
                <ReanimatedSwipeable //url: https://docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable
                  key={task.id}
                  ref={(ref) => {
                    if (ref && !swipeableRefs.has(task.id)) {
                      swipeableRefs.set(task.id, ref);
                    }
                  }}
                  friction={2}
                  enableTrackpadTwoFingerGesture
                  rightThreshold={40}
                  leftThreshold={40}
                  renderRightActions={(prog, drag) => RightAction(prog, drag, task.id)}
                  renderLeftActions={(prog, drag) => LeftAction(prog, drag, task.id)}
                  onSwipeableWillOpen={() => {
                    closeAllOtherSwipeables(task.id);
                  }}
                  onSwipeableOpen={(direction) => {
                    if (direction === 'left') {
                      deleteTask(task.id);
                    } else if (direction === 'right') {
                      toggleTask(task.id);
                    }
                  }}>
                  <View className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
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
                      <TouchableOpacity className="self-center" onPress={() => deleteTask(task.id)}>
                        <Trash2 size={24} color="red" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                </ReanimatedSwipeable>
              ))
            )}
          </ScrollView>
        </GestureHandlerRootView>

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
      <Toast />
    </SafeAreaView>
  );
};
