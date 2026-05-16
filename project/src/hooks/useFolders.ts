import { useState, useEffect } from 'react';

export interface FolderState {
  folders: string[];
  chatAssignments: Record<string, string>; // chatId -> folderName
}

export function useFolders() {
  const [folders, setFolders] = useState<string[]>([]);
  const [chatAssignments, setChatAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('codebolt_folders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FolderState;
        if (parsed.folders) setFolders(parsed.folders);
        if (parsed.chatAssignments) setChatAssignments(parsed.chatAssignments);
      } catch (e) {
        console.error("Failed to parse folders", e);
      }
    }
  }, []);

  const saveState = (f: string[], c: Record<string, string>) => {
    localStorage.setItem('codebolt_folders', JSON.stringify({ folders: f, chatAssignments: c }));
  };

  const createFolder = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || folders.includes(trimmed)) return false;
    const newFolders = [...folders, trimmed];
    setFolders(newFolders);
    saveState(newFolders, chatAssignments);
    return true;
  };

  const deleteFolder = (name: string) => {
    const newFolders = folders.filter(f => f !== name);
    const newAssignments = { ...chatAssignments };
    for (const key in newAssignments) {
      if (newAssignments[key] === name) {
        delete newAssignments[key];
      }
    }
    setFolders(newFolders);
    setChatAssignments(newAssignments);
    saveState(newFolders, newAssignments);
  };

  const assignChat = (chatId: string, folderName: string | null) => {
    const newAssignments = { ...chatAssignments };
    if (folderName === null) {
      delete newAssignments[chatId];
    } else {
      newAssignments[chatId] = folderName;
    }
    setChatAssignments(newAssignments);
    saveState(folders, newAssignments);
  };

  return {
    folders,
    chatAssignments,
    createFolder,
    deleteFolder,
    assignChat
  };
}
