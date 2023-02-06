import React from 'react';
import {
  CommandLineIcon,
  CircleStackIcon,
  WindowIcon,
  CodeBracketSquareIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { NodeType } from '../node-type';

export const createNodesConfig = [
  {
    id: NodeType.Form,
    icon: React.createElement(WindowIcon, { className: 'w-6 h-6' }),
    title: 'User Input',
    description: "Describe the block type and what it's for",
  },
  {
    id: NodeType.Rest,
    icon: React.createElement(CodeBracketSquareIcon, { className: 'w-6 h-6' }),
    title: 'Rest API',
    description: "Describe the block type and what it's for",
  },
  {
    id: NodeType.Database,
    icon: React.createElement(CircleStackIcon, { className: 'w-6 h-6' }),
    title: 'Database Query',
    description: "Describe the block type and what it's for",
  },
  {
    id: NodeType.Shell,
    icon: React.createElement(CommandLineIcon, { className: 'w-6 h-6' }),
    title: 'Shell Command',
    description: "Describe the block type and what it's for",
  },
  {
    id: NodeType.Markdown,
    icon: React.createElement(DocumentTextIcon, { className: 'w-6 h-6' }),
    title: 'Markdown',
    description: 'Markdown is a lightweight markup language',
  },
];
