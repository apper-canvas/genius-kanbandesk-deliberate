import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Icons
const PlusIcon = getIcon('plus');
const EditIcon = getIcon('edit-3');
const TrashIcon = getIcon('trash-2');
const AlertTriangleIcon = getIcon('alert-triangle');
const ChevronDownIcon = getIcon('chevron-down');
const CheckCircleIcon = getIcon('check-circle');
const XIcon = getIcon('x');
const SettingsIcon = getIcon('settings');
const UserIcon = getIcon('user');
const CalendarIcon = getIcon('calendar');
const TagIcon = getIcon('tag');
const SearchIcon = getIcon('search');
const DownloadIcon = getIcon('download');
const UploadIcon = getIcon('upload');
const GripIcon = getIcon('grip');

// Component for individual ticket
const TicketCard = ({ ticket, onEdit, onDelete, id, isOverlay = false }) => {
  // Priority badge styling
  const priorityStyles = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${
        isOverlay ? 'shadow-lg' : ''
      } bg-white dark:bg-surface-800 rounded-lg shadow-card border border-surface-200 dark:border-surface-700 p-3 mb-3 cursor-grab active:cursor-grabbing`}
      style={{
        borderLeft: `4px solid ${
          ticket.priority === 'High' 
            ? '#ef4444' 
            : ticket.priority === 'Medium' 
              ? '#f59e0b' 
              : '#10b981'
        }`
      }}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-surface-900 dark:text-white">{ticket.title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ticket);
            }}
            className="text-surface-500 hover:text-primary p-1 rounded-md"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              onDelete(ticket.id);
            }}
            className="text-surface-500 hover:text-red-500 p-1 rounded-md"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-surface-600 dark:text-surface-400 line-clamp-2">
        {ticket.description ? (
          <div dangerouslySetInnerHTML={{ __html: ticket.description.substring(0, 100) + (ticket.description.length > 100 ? '...' : '') }} />
        ) : (
          <span className="italic text-surface-400 dark:text-surface-500">No description</span>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${priorityStyles[ticket.priority]}`}>
          <AlertTriangleIcon className="h-3 w-3 mr-1" />
          {ticket.priority}
        </span>
        
        {ticket.assignee && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-xs font-medium">
            <UserIcon className="h-3 w-3 mr-1" />
            {ticket.assignee}
          </span>
        )}
        
        {ticket.dueDate && (
          <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-md text-xs font-medium">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {format(new Date(ticket.dueDate), 'MMM d')}
          </span>
        )}
      </div>
      
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {ticket.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Sortable ticket component
const SortableTicket = ({ ticket, onEdit, onDelete, id, listeners }) => {
  return (
    <div className="sortable-item" id={id} {...listeners}>
      <TicketCard 
        ticket={ticket} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        id={id} 
      />
    </div>
  );
};

// Component for board column
const Column = ({ column, tickets, onAddTicket, onEditTicket, onDeleteTicket, onDeleteColumn, onColumnEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const [activeId, setActiveId] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);
    const foundTicket = tickets.find((ticket) => ticket.id === active.id);
    setActiveTicket(foundTicket);
  }, [tickets]);
  
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = tickets.findIndex((ticket) => ticket.id === active.id);
      const newIndex = tickets.findIndex((ticket) => ticket.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTickets = arrayMove(tickets, oldIndex, newIndex);
        // Here you would update your state with the new order
        // For now, we're just console logging
        console.log('Reordered tickets:', newTickets);
      }
    }
    
    setActiveId(null);
    setActiveTicket(null);
  }, [tickets]);
  
  const handleColumnNameSave = () => {
    if (columnName.trim() !== '') {
      onColumnEdit(column.id, columnName);
      setIsEditing(false);
    }
  };
  
  return (
    <div className="bg-surface-100 dark:bg-surface-800 rounded-lg p-3 shadow-sm w-full md:w-80 flex-shrink-0 h-full flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <div className="flex w-full space-x-2">
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="flex-grow px-2 py-1 border border-surface-300 dark:border-surface-600 rounded-md focus:border-primary dark:focus:border-primary bg-white dark:bg-surface-700"
              autoFocus
            />
            <button 
              onClick={handleColumnNameSave}
              className="text-white bg-primary hover:bg-primary-dark p-1 rounded-md"
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => {
                setColumnName(column.name);
                setIsEditing(false);
              }}
              className="text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white p-1 rounded-md"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center">
              <h2 className="font-medium text-surface-900 dark:text-white">
                {column.name}
              </h2>
              <span className="ml-2 bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 text-xs font-medium rounded-full px-2 py-0.5">
                {tickets.length}
              </span>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => setIsEditing(true)}
                className="text-surface-500 hover:text-primary p-1 rounded-md"
              >
                <EditIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onDeleteColumn(column.id)}
                className="text-surface-500 hover:text-red-500 p-1 rounded-md"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Add new ticket button */}
      <button
        onClick={() => onAddTicket(column.id)}
        className="mb-3 w-full py-2 px-3 bg-white dark:bg-surface-700 border border-dashed border-surface-300 dark:border-surface-600 rounded-lg text-surface-500 dark:text-surface-400 hover:text-primary dark:hover:text-primary-light hover:border-primary dark:hover:border-primary-light transition-colors duration-200 text-sm flex items-center justify-center"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Ticket
      </button>
      
      {/* Tickets container */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tickets.map((ticket) => ticket.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {tickets.map((ticket) => (
                <SortableTicket
                  key={ticket.id}
                  id={ticket.id}
                  ticket={ticket}
                  onEdit={onEditTicket}
                  onDelete={onDeleteTicket}
                  listeners={{}}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
          
          <DragOverlay>
            {activeId ? (
              <TicketCard
                ticket={activeTicket}
                onEdit={onEditTicket}
                onDelete={onDeleteTicket}
                id={activeId}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

// Ticket form modal
const TicketFormModal = ({ isOpen, onClose, onSave, editingTicket, columnId }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'Medium',
    assignee: '',
    customer: '',
    createdDate: new Date().toISOString(),
    dueDate: '',
    status: '',
    columnId: columnId,
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');
  
  // Reset form when modal opens/closes or editing ticket changes
  useEffect(() => {
    if (isOpen) {
      if (editingTicket) {
        setFormData({
          ...editingTicket,
          dueDate: editingTicket.dueDate || '',
        });
      } else {
        setFormData({
          id: Math.random().toString(36).substr(2, 9),
          title: '',
          description: '',
          priority: 'Medium',
          assignee: '',
          customer: '',
          createdDate: new Date().toISOString(),
          dueDate: '',
          status: '',
          columnId: columnId,
          tags: [],
        });
      }
    }
  }, [isOpen, editingTicket, columnId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagAdd = () => {
    if (tagInput.trim() !== '' && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    onSave(formData);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 mx-auto"
            >
              <div className="absolute top-4 right-4">
                <button 
                  onClick={onClose}
                  className="text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <h2 className="text-lg font-semibold mb-4 text-surface-900 dark:text-white">
                {editingTicket ? 'Edit Ticket' : 'Add New Ticket'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter ticket title"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input min-h-[100px]"
                      placeholder="Enter ticket description"
                    />
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="input appearance-none pr-10"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDownIcon className="h-4 w-4 text-surface-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Assignee & Customer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Assignee
                      </label>
                      <input
                        type="text"
                        name="assignee"
                        value={formData.assignee}
                        onChange={handleChange}
                        className="input"
                        placeholder="Who is responsible?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Customer
                      </label>
                      <input
                        type="text"
                        name="customer"
                        value={formData.customer}
                        onChange={handleChange}
                        className="input"
                        placeholder="Customer name"
                      />
                    </div>
                  </div>
                  
                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate ? formData.dueDate.substring(0, 10) : ''}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                        className="input rounded-r-none flex-grow"
                        placeholder="Add tag"
                      />
                      <button
                        type="button"
                        onClick={handleTagAdd}
                        className="px-3 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className="ml-1 text-surface-500 hover:text-red-500"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      {editingTicket ? 'Update Ticket' : 'Create Ticket'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Main component
const MainFeature = () => {
  // State for all board data
  const [columns, setColumns] = useState(() => {
    const savedData = localStorage.getItem('kanbandesk-data');
    if (savedData) {
      try {
        return JSON.parse(savedData).columns || defaultColumns;
      } catch (e) {
        console.error('Error parsing saved data:', e);
        return defaultColumns;
      }
    }
    return defaultColumns;
  });
  
  const [tickets, setTickets] = useState(() => {
    const savedData = localStorage.getItem('kanbandesk-data');
    if (savedData) {
      try {
        return JSON.parse(savedData).tickets || [];
      } catch (e) {
        console.error('Error parsing saved data:', e);
        return [];
      }
    }
    return [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  
  // Default columns for initial setup
  const defaultColumns = [
    { id: '1', name: 'New', order: 0 },
    { id: '2', name: 'In Progress', order: 1 },
    { id: '3', name: 'Waiting for Customer', order: 2 },
    { id: '4', name: 'Resolved', order: 3 },
  ];
  
  // Save data to localStorage whenever tickets or columns change
  useEffect(() => {
    localStorage.setItem('kanbandesk-data', JSON.stringify({ tickets, columns }));
  }, [tickets, columns]);
  
  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.title.toLowerCase().includes(query) ||
      (ticket.description && ticket.description.toLowerCase().includes(query)) ||
      (ticket.assignee && ticket.assignee.toLowerCase().includes(query)) ||
      (ticket.customer && ticket.customer.toLowerCase().includes(query)) ||
      (ticket.tags && ticket.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });
  
  // Handlers
  const handleAddTicket = (columnId) => {
    setSelectedColumnId(columnId);
    setEditingTicket(null);
    setIsModalOpen(true);
  };
  
  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setSelectedColumnId(ticket.columnId);
    setIsModalOpen(true);
  };
  
  const handleDeleteTicket = (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      toast.success('Ticket deleted successfully');
    }
  };
  
  const handleSaveTicket = (ticketData) => {
    if (editingTicket) {
      // Update existing ticket
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketData.id ? ticketData : ticket
        )
      );
      toast.success('Ticket updated successfully');
    } else {
      // Add new ticket
      setTickets(prev => [...prev, ticketData]);
      toast.success('Ticket created successfully');
    }
    setIsModalOpen(false);
  };
  
  const handleAddColumn = () => {
    if (newColumnName.trim() === '') {
      toast.error('Column name cannot be empty');
      return;
    }
    
    const newColumn = {
      id: Math.random().toString(36).substr(2, 9),
      name: newColumnName,
      order: columns.length,
    };
    
    setColumns(prev => [...prev, newColumn]);
    setNewColumnName('');
    setShowAddColumn(false);
    toast.success('Column added successfully');
  };
  
  const handleDeleteColumn = (columnId) => {
    // Check if column has tickets
    const hasTickets = tickets.some(ticket => ticket.columnId === columnId);
    
    if (hasTickets) {
      toast.error('Cannot delete column with tickets. Move or delete the tickets first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this column?')) {
      setColumns(prev => prev.filter(column => column.id !== columnId));
      toast.success('Column deleted successfully');
    }
  };
  
  const handleEditColumn = (columnId, newName) => {
    if (newName.trim() === '') {
      toast.error('Column name cannot be empty');
      return;
    }
    
    setColumns(prev => 
      prev.map(column => 
        column.id === columnId 
          ? { ...column, name: newName } 
          : column
      )
    );
    
    toast.success('Column updated successfully');
  };
  
  // Export tickets to CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) {
      toast.error('No tickets to export');
      return;
    }
    
    // Create CSV header
    const headers = [
      'Title',
      'Description',
      'Priority',
      'Assignee',
      'Customer',
      'Created Date',
      'Due Date',
      'Status',
      'Tags'
    ].join(',');
    
    // Create CSV rows
    const rows = tickets.map(ticket => {
      const status = columns.find(col => col.id === ticket.columnId)?.name || '';
      return [
        `"${ticket.title.replace(/"/g, '""')}"`,
        `"${(ticket.description || '').replace(/"/g, '""').replace(/<[^>]*>/g, '')}"`,
        ticket.priority,
        `"${(ticket.assignee || '').replace(/"/g, '""')}"`,
        `"${(ticket.customer || '').replace(/"/g, '""')}"`,
        ticket.createdDate ? new Date(ticket.createdDate).toISOString().split('T')[0] : '',
        ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : '',
        `"${status.replace(/"/g, '""')}"`,
        `"${(ticket.tags || []).join(', ').replace(/"/g, '""')}"`
      ].join(',');
    });
    
    // Combine header and rows
    const csv = [headers, ...rows].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanbandesk-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Tickets exported successfully');
  };
  
  // Import tickets from CSV
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
          toast.error('CSV file is empty or invalid');
          return;
        }
        
        const headers = lines[0].split(',');
        
        // Find column indexes
        const titleIndex = headers.findIndex(h => h.trim().toLowerCase() === 'title');
        const descriptionIndex = headers.findIndex(h => h.trim().toLowerCase() === 'description');
        const priorityIndex = headers.findIndex(h => h.trim().toLowerCase() === 'priority');
        const assigneeIndex = headers.findIndex(h => h.trim().toLowerCase() === 'assignee');
        const customerIndex = headers.findIndex(h => h.trim().toLowerCase() === 'customer');
        const createdDateIndex = headers.findIndex(h => h.trim().toLowerCase() === 'created date');
        const dueDateIndex = headers.findIndex(h => h.trim().toLowerCase() === 'due date');
        const statusIndex = headers.findIndex(h => h.trim().toLowerCase() === 'status');
        const tagsIndex = headers.findIndex(h => h.trim().toLowerCase() === 'tags');
        
        if (titleIndex === -1) {
          toast.error('CSV must include a "Title" column');
          return;
        }
        
        const newTickets = [];
        
        // Parse CSV rows starting from index 1 (skip header)
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Handle CSV values with commas inside quotes
          const row = [];
          let inQuotes = false;
          let currentValue = '';
          
          for (let char of lines[i]) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              row.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          row.push(currentValue);
          
          // Get column ID based on status
          const status = statusIndex !== -1 ? row[statusIndex].replace(/"/g, '') : 'New';
          let columnId = columns.find(col => col.name === status)?.id;
          
          // If no matching column, use the first column
          if (!columnId) {
            columnId = columns[0].id;
          }
          
          // Create ticket object
          const ticket = {
            id: Math.random().toString(36).substr(2, 9),
            title: titleIndex !== -1 ? row[titleIndex].replace(/"/g, '') : 'Imported Ticket',
            description: descriptionIndex !== -1 ? row[descriptionIndex].replace(/"/g, '') : '',
            priority: priorityIndex !== -1 ? row[priorityIndex].replace(/"/g, '') : 'Medium',
            assignee: assigneeIndex !== -1 ? row[assigneeIndex].replace(/"/g, '') : '',
            customer: customerIndex !== -1 ? row[customerIndex].replace(/"/g, '') : '',
            createdDate: createdDateIndex !== -1 && row[createdDateIndex] ? new Date(row[createdDateIndex]).toISOString() : new Date().toISOString(),
            dueDate: dueDateIndex !== -1 && row[dueDateIndex] ? new Date(row[dueDateIndex]).toISOString() : '',
            columnId: columnId,
            tags: tagsIndex !== -1 ? row[tagsIndex].replace(/"/g, '').split(',').map(tag => tag.trim()).filter(Boolean) : [],
          };
          
          newTickets.push(ticket);
        }
        
        if (newTickets.length === 0) {
          toast.error('No valid tickets found in CSV');
          return;
        }
        
        setTickets(prev => [...prev, ...newTickets]);
        toast.success(`Imported ${newTickets.length} tickets successfully`);
        
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast.error('Error importing CSV. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-9.5rem)]">
      {/* Tools section */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-auto max-w-md">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <label className="btn bg-surface-200 hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-800 dark:text-surface-200 cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />
            <UploadIcon className="h-5 w-5 mr-2" />
            Import CSV
          </label>
          
          <button
            onClick={handleExportCSV}
            className="btn bg-surface-200 hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-800 dark:text-surface-200"
          >
            <DownloadIcon className="h-5 w-5 mr-2" />
            Export CSV
          </button>
          
          <button
            onClick={() => setShowAddColumn(true)}
            className="btn bg-primary hover:bg-primary-dark text-white"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Column
          </button>
        </div>
      </div>
      
      {/* Add column form */}
      <AnimatePresence>
        {showAddColumn && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-surface-100 dark:bg-surface-800 p-4 rounded-lg">
              <div className="flex items-end gap-3">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Column Name
                  </label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="input"
                    placeholder="Enter column name"
                  />
                </div>
                <button
                  onClick={handleAddColumn}
                  className="btn bg-primary hover:bg-primary-dark text-white"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddColumn(false)}
                  className="btn bg-surface-200 hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-800 dark:text-surface-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Kanban board */}
      <div className="flex-grow overflow-x-auto custom-scrollbar">
        <div className="flex gap-4 h-full p-1 pb-4">
          {columns.sort((a, b) => a.order - b.order).map((column) => (
            <Column
              key={column.id}
              column={column}
              tickets={filteredTickets.filter(ticket => ticket.columnId === column.id)}
              onAddTicket={handleAddTicket}
              onEditTicket={handleEditTicket}
              onDeleteTicket={handleDeleteTicket}
              onDeleteColumn={handleDeleteColumn}
              onColumnEdit={handleEditColumn}
            />
          ))}
        </div>
      </div>
      
      {/* Ticket modal */}
      <TicketFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        editingTicket={editingTicket}
        columnId={selectedColumnId}
      />
    </div>
  );
};

export default MainFeature;