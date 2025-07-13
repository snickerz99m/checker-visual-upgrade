import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Download, Upload, Save, Code, Settings, FileText, Zap, ArrowLeft, Copy, Eye, MoreHorizontal, Trash, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CHECKER_CONFIGS, CHECKER_CATEGORIES, CheckerConfig } from '@/config/checkers';
import { getAllCategories, saveCustomCategory, createPHPFile } from '@/config/dynamicCheckers';

interface PHPFile {
  filename: string;
  content: string;
  lastModified: Date;
}

const AdminPanel = () => {
  const [checkers, setCheckers] = useState<CheckerConfig[]>(CHECKER_CONFIGS);
  const [newChecker, setNewChecker] = useState({
    value: '',
    label: '',
    category: CHECKER_CATEGORIES.BASIC as string,
    requiresKey: false,
    keyLabel: '',
    description: ''
  });
  const [editingChecker, setEditingChecker] = useState<CheckerConfig | null>(null);
  const [phpFiles, setPHPFiles] = useState<PHPFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PHPFile | null>(null);
  const [phpCode, setPHPCode] = useState('');
  const [isEditingPHP, setIsEditingPHP] = useState(false);
  const [selectedCheckers, setSelectedCheckers] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<string[]>(() => getAllCategories());
  const { toast } = useToast();

  // Load saved data from localStorage
  useEffect(() => {
    const savedCheckers = localStorage.getItem('customCheckers');
    const savedPHPFiles = localStorage.getItem('phpFiles');
    const hiddenBuiltIns = localStorage.getItem('hiddenBuiltInCheckers');
    const checkerOverrides = localStorage.getItem('checkerOverrides');
    
    let allCheckers = [...CHECKER_CONFIGS];
    
    // Add custom checkers
    if (savedCheckers) {
      try {
        const custom = JSON.parse(savedCheckers);
        allCheckers = [...allCheckers, ...custom];
      } catch (error) {
        console.error('Error loading saved checkers:', error);
      }
    }
    
    // Remove hidden built-in checkers
    if (hiddenBuiltIns) {
      try {
        const hidden = JSON.parse(hiddenBuiltIns);
        allCheckers = allCheckers.filter(c => !hidden.includes(c.value));
      } catch (error) {
        console.error('Error loading hidden checkers:', error);
      }
    }
    
    // Apply overrides to built-in checkers
    if (checkerOverrides) {
      try {
        const overrides = JSON.parse(checkerOverrides);
        allCheckers = allCheckers.map(c => overrides[c.value] || c);
      } catch (error) {
        console.error('Error loading checker overrides:', error);
      }
    }
    
    setCheckers(allCheckers);
    
    if (savedPHPFiles) {
      try {
        const files = JSON.parse(savedPHPFiles);
        setPHPFiles(files.map((f: any) => ({
          ...f,
          lastModified: new Date(f.lastModified)
        })));
      } catch (error) {
        console.error('Error loading saved PHP files:', error);
      }
    }
  }, []);

  // Generate PHP template
  const generatePHPTemplate = (checkerName: string, functionName: string) => {
    return `<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data']);
    exit();
}

$cardNumber = $input['cardNumber'] ?? '';
$expiry = $input['expiry'] ?? '';
$cvv = $input['cvv'] ?? '';
$settings = $input['settings'] ?? [];

if (empty($cardNumber) || empty($expiry) || empty($cvv)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

try {
    $result = ${functionName}($cardNumber, $expiry, $cvv);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => '${checkerName} error: ' . $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}

function ${functionName}($card, $exp, $cvv) {
    // TODO: Add your ${checkerName} checker logic here
    
    // Example API call structure:
    /*
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'YOUR_API_ENDPOINT',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'card_number' => $card,
            'exp_month' => substr($exp, 0, 2),
            'exp_year' => '20' . substr($exp, 2, 2),
            'cvc' => $cvv
        ]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer YOUR_API_KEY'
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    if ($response === false) {
        throw new Exception('cURL error: ' . curl_error($curl));
    }
    
    $data = json_decode($response, true);
    
    // Process your API response here and return standardized format
    */
    
    return [
        'status' => 'error',
        'message' => '${checkerName} checker not implemented - add your logic above',
        'cardNumber' => $card,
        'bin' => substr($card, 0, 6),
        'last4' => substr($card, -4),
        'brand' => determineBrand($card),
        'country' => '', // Add if available from your API
        'bank' => '', // Add if available from your API
        'checkTime' => time()
    ];
}

function determineBrand($cardNumber) {
    $firstDigit = substr($cardNumber, 0, 1);
    $firstTwo = substr($cardNumber, 0, 2);
    $firstFour = substr($cardNumber, 0, 4);
    
    if ($firstDigit === '4') return 'Visa';
    if (in_array($firstTwo, ['51', '52', '53', '54', '55']) || 
        ($firstFour >= '2221' && $firstFour <= '2720')) return 'Mastercard';
    if (in_array($firstTwo, ['34', '37'])) return 'American Express';
    if ($firstTwo === '60' || $firstFour === '6011' || 
        ($firstFour >= '6440' && $firstFour <= '6499')) return 'Discover';
    if ($firstFour === '3528' || ($firstFour >= '3530' && $firstFour <= '3589')) return 'JCB';
    
    return 'Unknown';
}
?>`;
  };

  // Add new checker
  const addChecker = () => {
    if (!newChecker.value || !newChecker.label) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    // Ensure filename ends with .php
    const filename = newChecker.value.endsWith('.php') ? newChecker.value : `${newChecker.value}.php`;
    
    const checker: CheckerConfig = {
      ...newChecker,
      value: filename
    };

    // Check if checker already exists
    if (checkers.some(c => c.value === checker.value)) {
      toast({
        title: "Error",
        description: "Checker with this filename already exists",
        variant: "destructive"
      });
      return;
    }

    const updatedCheckers = [...checkers, checker];
    setCheckers(updatedCheckers);

    // Save custom checkers to localStorage and trigger update event
    const customCheckers = updatedCheckers.filter(c => !CHECKER_CONFIGS.includes(c));
    localStorage.setItem('customCheckers', JSON.stringify(customCheckers));
    
    // Trigger events to update components and API endpoints
    window.dispatchEvent(new CustomEvent('checkersUpdated'));
    window.dispatchEvent(new CustomEvent('apiEndpointsUpdated'));

    // Generate PHP file and auto-download
    const functionName = filename.replace(/[^a-zA-Z0-9]/g, '') + 'Check';
    const phpContent = generatePHPTemplate(newChecker.label, functionName);
    
    const phpFile: PHPFile = {
      filename,
      content: phpContent,
      lastModified: new Date()
    };

    const updatedPHPFiles = [...phpFiles, phpFile];
    setPHPFiles(updatedPHPFiles);
    localStorage.setItem('phpFiles', JSON.stringify(updatedPHPFiles));

    // Auto-download the PHP file to user's php folder
    createPHPFile(filename, phpContent);

    // Reset form
    setNewChecker({
      value: '',
      label: '',
      category: CHECKER_CATEGORIES.BASIC,
      requiresKey: false,
      keyLabel: '',
      description: ''
    });

    toast({
      title: "Success",
      description: `Checker "${checker.label}" created successfully with PHP file`,
    });
  };

  // Delete checker (works for both built-in and custom)
  const deleteChecker = (checkerValue: string) => {
    const isBuiltIn = CHECKER_CONFIGS.some(c => c.value === checkerValue);
    
    if (isBuiltIn) {
      // For built-in checkers, remove from display list only
      const updatedCheckers = checkers.filter(c => c.value !== checkerValue);
      setCheckers(updatedCheckers);
      
      // Save hidden built-in checkers
      const hiddenBuiltIns = CHECKER_CONFIGS.filter(c => !updatedCheckers.includes(c)).map(c => c.value);
      localStorage.setItem('hiddenBuiltInCheckers', JSON.stringify(hiddenBuiltIns));
      
      toast({
        title: "Success",
        description: "Built-in checker hidden from interface",
      });
    } else {
      // For custom checkers, permanently delete
      const updatedCheckers = checkers.filter(c => c.value !== checkerValue);
      setCheckers(updatedCheckers);

      // Update localStorage
      const customCheckers = updatedCheckers.filter(c => !CHECKER_CONFIGS.includes(c));
      localStorage.setItem('customCheckers', JSON.stringify(customCheckers));

      // Delete associated PHP file
      const updatedPHPFiles = phpFiles.filter(f => f.filename !== checkerValue);
      setPHPFiles(updatedPHPFiles);
      localStorage.setItem('phpFiles', JSON.stringify(updatedPHPFiles));

      toast({
        title: "Success",
        description: "Custom checker and PHP file deleted permanently",
      });
    }
  };

  // Edit checker
  const editChecker = (checker: CheckerConfig) => {
    setEditingChecker(checker);
    setIsEditDialogOpen(true);
  };

  // Save edited checker
  const saveEditedChecker = () => {
    if (!editingChecker) return;

    const isBuiltIn = CHECKER_CONFIGS.some(c => c.value === editingChecker.value);
    
    if (isBuiltIn) {
      // For built-in checkers, save as override
      const customOverrides = JSON.parse(localStorage.getItem('checkerOverrides') || '{}');
      customOverrides[editingChecker.value] = editingChecker;
      localStorage.setItem('checkerOverrides', JSON.stringify(customOverrides));
      
      // Update display
      const updatedCheckers = checkers.map(c => 
        c.value === editingChecker.value ? editingChecker : c
      );
      setCheckers(updatedCheckers);
    } else {
      // For custom checkers, update normally
      const updatedCheckers = checkers.map(c => 
        c.value === editingChecker.value ? editingChecker : c
      );
      setCheckers(updatedCheckers);

      const customCheckers = updatedCheckers.filter(c => !CHECKER_CONFIGS.includes(c));
      localStorage.setItem('customCheckers', JSON.stringify(customCheckers));
    }

    setIsEditDialogOpen(false);
    setEditingChecker(null);

    toast({
      title: "Success",
      description: "Checker updated successfully",
    });
  };

  // Duplicate checker
  const duplicateChecker = (checker: CheckerConfig) => {
    const newValue = `${checker.value.replace('.php', '')}-copy.php`;
    const newChecker: CheckerConfig = {
      ...checker,
      value: newValue,
      label: `${checker.label} (Copy)`
    };

    const updatedCheckers = [...checkers, newChecker];
    setCheckers(updatedCheckers);

    // Save as custom checker
    const customCheckers = updatedCheckers.filter(c => !CHECKER_CONFIGS.includes(c));
    localStorage.setItem('customCheckers', JSON.stringify(customCheckers));

    // Create PHP file if original exists
    const originalPHP = phpFiles.find(f => f.filename === checker.value);
    if (originalPHP) {
      const newPHPFile: PHPFile = {
        filename: newValue,
        content: originalPHP.content,
        lastModified: new Date()
      };
      
      const updatedPHPFiles = [...phpFiles, newPHPFile];
      setPHPFiles(updatedPHPFiles);
      localStorage.setItem('phpFiles', JSON.stringify(updatedPHPFiles));
    }

    toast({
      title: "Success",
      description: "Checker duplicated successfully",
    });
  };

  // Bulk delete selected checkers
  const bulkDeleteCheckers = () => {
    selectedCheckers.forEach(checkerValue => {
      deleteChecker(checkerValue);
    });
    setSelectedCheckers([]);
    
    toast({
      title: "Success",
      description: `Deleted ${selectedCheckers.length} checkers`,
    });
  };

  // Toggle checker selection
  const toggleCheckerSelection = (checkerValue: string) => {
    setSelectedCheckers(prev => 
      prev.includes(checkerValue)
        ? prev.filter(v => v !== checkerValue)
        : [...prev, checkerValue]
    );
  };

  // Select all checkers
  const selectAllCheckers = () => {
    if (selectedCheckers.length === checkers.length) {
      setSelectedCheckers([]);
    } else {
      setSelectedCheckers(checkers.map(c => c.value));
    }
  };

  // Edit PHP file
  const editPHPFile = (file: PHPFile) => {
    setSelectedFile(file);
    setPHPCode(file.content);
    setIsEditingPHP(true);
  };

  // Save PHP file
  const savePHPFile = () => {
    if (!selectedFile) return;

    const updatedFiles = phpFiles.map(f => 
      f.filename === selectedFile.filename 
        ? { ...f, content: phpCode, lastModified: new Date() }
        : f
    );
    
    setPHPFiles(updatedFiles);
    localStorage.setItem('phpFiles', JSON.stringify(updatedFiles));
    setIsEditingPHP(false);
    setSelectedFile(null);

    toast({
      title: "Success",
      description: "PHP file saved successfully",
    });
  };

  // Download PHP file
  const downloadPHPFile = (file: PHPFile) => {
    const blob = new Blob([file.content], { type: 'text/php' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download configuration file
  const downloadConfigFile = () => {
    const customCheckers = checkers.filter(c => !CHECKER_CONFIGS.includes(c));
    const configContent = `// Auto-generated checker configuration
// Import this to your src/config/checkers.ts file

export const CUSTOM_CHECKERS: CheckerConfig[] = ${JSON.stringify(customCheckers, null, 2)};

// Add these to your CHECKER_CONFIGS array:
${customCheckers.map(c => `  ${JSON.stringify(c)},`).join('\n')}
`;
    
    const blob = new Blob([configContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-checkers-config.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back to Main App Button */}
        <div className="flex justify-between items-center">
          <Link to="/">
            <Button variant="outline" className="cyber-glow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Main App
            </Button>
          </Link>
        </div>
        
        <Card className="glass neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="w-5 h-5" />
              Admin Panel - Checker Management
            </CardTitle>
            <CardDescription className="text-gray-300">
              Create, edit, and manage your custom checker types and PHP files
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="checkers" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="checkers">Manage Checkers</TabsTrigger>
            <TabsTrigger value="php-files">PHP Files</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
          </TabsList>

          <TabsContent value="checkers" className="space-y-6">
            {/* Add New Checker */}
            <Card className="glass neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5" />
                  Create New Checker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Filename (required)</Label>
                    <Input
                      placeholder="my-checker.php"
                      value={newChecker.value}
                      onChange={(e) => setNewChecker({...newChecker, value: e.target.value})}
                      className="cyber-glow"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Display Name (required)</Label>
                    <Input
                      placeholder="My Custom Checker"
                      value={newChecker.label}
                      onChange={(e) => setNewChecker({...newChecker, label: e.target.value})}
                      className="cyber-glow"
                    />
                  </div>
                  
                   <div className="space-y-2">
                     <Label className="text-white">Category</Label>
                     <Select value={newChecker.category} onValueChange={(value) => setNewChecker({...newChecker, category: value})}>
                       <SelectTrigger className="cyber-glow">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {categories.map(category => (
                           <SelectItem key={category} value={category}>{category}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Description (optional)</Label>
                  <Textarea
                    placeholder="Brief description of what this checker does"
                    value={newChecker.description}
                    onChange={(e) => setNewChecker({...newChecker, description: e.target.value})}
                    className="cyber-glow"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="cyber-glow"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      if (newCategory.trim()) {
                        saveCustomCategory(newCategory.trim());
                        setCategories(getAllCategories());
                        setNewCategory('');
                        toast({
                          title: "Success",
                          description: "Category added successfully",
                        });
                      }
                    }}
                    variant="outline"
                  >
                    Add Category
                  </Button>
                </div>

                <Button onClick={addChecker} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Checker & Generate PHP File
                </Button>
              </CardContent>
            </Card>

            {/* Existing Checkers */}
            <Card className="glass neon-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Existing Checkers ({checkers.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={selectAllCheckers}
                      className="cyber-glow"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {selectedCheckers.length === checkers.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    {selectedCheckers.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Selected ({selectedCheckers.length})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass neon-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Selected Checkers?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete {selectedCheckers.length} checkers. Built-in checkers will be hidden, custom checkers will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={bulkDeleteCheckers}>
                              Delete Selected
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white w-12">
                          <Checkbox 
                            checked={selectedCheckers.length === checkers.length}
                            onCheckedChange={selectAllCheckers}
                          />
                        </TableHead>
                        <TableHead className="text-white">Filename</TableHead>
                        <TableHead className="text-white">Display Name</TableHead>
                        <TableHead className="text-white">Category</TableHead>
                        <TableHead className="text-white">Type</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkers.map((checker) => {
                        const isBuiltIn = CHECKER_CONFIGS.some(c => c.value === checker.value);
                        const isSelected = selectedCheckers.includes(checker.value);
                        
                        return (
                          <TableRow key={checker.value}>
                            <TableCell>
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => toggleCheckerSelection(checker.value)}
                              />
                            </TableCell>
                            <TableCell className="text-white font-mono">{checker.value}</TableCell>
                            <TableCell className="text-white">{checker.label}</TableCell>
                            <TableCell className="text-white">{checker.category}</TableCell>
                            <TableCell>
                              <Badge variant={isBuiltIn ? "default" : "secondary"}>
                                {isBuiltIn ? "Built-in" : "Custom"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => editChecker(checker)}
                                  className="cyber-glow"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                 <Button 
                                   size="sm" 
                                   variant="outline" 
                                   onClick={() => duplicateChecker(checker)}
                                   className="cyber-glow"
                                 >
                                   <Copy className="w-4 h-4" />
                                 </Button>
                                 
                                 <Button 
                                   size="sm" 
                                   variant="outline" 
                                   onClick={() => {
                                     // For built-in checkers, create/edit PHP file
                                     const existingFile = phpFiles.find(f => f.filename === checker.value);
                                     if (existingFile) {
                                       editPHPFile(existingFile);
                                     } else {
                                       // Create new PHP file for built-in checker
                                       const functionName = checker.value.replace(/[^a-zA-Z0-9]/g, '') + 'Check';
                                       const phpContent = generatePHPTemplate(checker.label, functionName);
                                       const newFile: PHPFile = {
                                         filename: checker.value,
                                         content: phpContent,
                                         lastModified: new Date()
                                       };
                                       const updatedPHPFiles = [...phpFiles, newFile];
                                       setPHPFiles(updatedPHPFiles);
                                       localStorage.setItem('phpFiles', JSON.stringify(updatedPHPFiles));
                                       editPHPFile(newFile);
                                     }
                                   }}
                                   className="cyber-glow"
                                 >
                                   <Code className="w-4 h-4" />
                                 </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="glass neon-border">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {isBuiltIn ? 'Hide Built-in Checker?' : 'Delete Custom Checker?'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {isBuiltIn 
                                          ? 'This will hide the built-in checker from the interface. You can restore it later.' 
                                          : 'This will permanently delete the custom checker and its PHP file. This action cannot be undone.'
                                        }
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteChecker(checker.value)}>
                                        {isBuiltIn ? 'Hide' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="php-files" className="space-y-6">
            <Card className="glass neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Code className="w-5 h-5" />
                  PHP Files Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* File List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Files ({phpFiles.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {phpFiles.map((file) => (
                        <Card key={file.filename} className="glass">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">{file.filename}</h4>
                                <p className="text-sm text-gray-300">
                                  Modified: {file.lastModified.toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => editPHPFile(file)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => downloadPHPFile(file)}>
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        {isEditingPHP ? `Editing: ${selectedFile?.filename}` : 'Select a file to edit'}
                      </h3>
                      {isEditingPHP && (
                        <div className="flex gap-2">
                          <Button onClick={savePHPFile}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditingPHP(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Textarea
                      value={phpCode}
                      onChange={(e) => setPHPCode(e.target.value)}
                      placeholder={isEditingPHP ? "Edit your PHP code here..." : "Select a file to view/edit its code"}
                      className="cyber-glow min-h-96 font-mono text-sm"
                      disabled={!isEditingPHP}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="glass neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5" />
                  Export & Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-white">Export Configuration</CardTitle>
                      <CardDescription>Download your custom checkers configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={downloadConfigFile} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Config File
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-white">Download All PHP Files</CardTitle>
                      <CardDescription>Get all your PHP files in a single download</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => {
                          phpFiles.forEach(file => downloadPHPFile(file));
                          toast({
                            title: "Success",
                            description: `Downloaded ${phpFiles.length} PHP files`,
                          });
                        }}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All PHP Files
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Checker Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass neon-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Checker</DialogTitle>
              <DialogDescription>
                {editingChecker && CHECKER_CONFIGS.some(c => c.value === editingChecker.value)
                  ? 'Editing a built-in checker will create an override that can be reset later.'
                  : 'Edit the custom checker configuration.'
                }
              </DialogDescription>
            </DialogHeader>
            
            {editingChecker && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Filename</Label>
                    <Input
                      value={editingChecker.value}
                      onChange={(e) => setEditingChecker({...editingChecker, value: e.target.value})}
                      className="cyber-glow"
                      disabled={CHECKER_CONFIGS.some(c => c.value === editingChecker.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Display Name</Label>
                    <Input
                      value={editingChecker.label}
                      onChange={(e) => setEditingChecker({...editingChecker, label: e.target.value})}
                      className="cyber-glow"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Category</Label>
                  <Select 
                    value={editingChecker.category} 
                    onValueChange={(value) => setEditingChecker({...editingChecker, category: value})}
                  >
                    <SelectTrigger className="cyber-glow">
                      <SelectValue />
                    </SelectTrigger>
                     <SelectContent>
                       {categories.map(category => (
                         <SelectItem key={category} value={category}>{category}</SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={editingChecker.description || ''}
                    onChange={(e) => setEditingChecker({...editingChecker, description: e.target.value})}
                    className="cyber-glow"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveEditedChecker}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <Card className="glass neon-border mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{checkers.length}</div>
                <div className="text-sm text-gray-300">Total Checkers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{checkers.filter(c => !CHECKER_CONFIGS.includes(c)).length}</div>
                <div className="text-sm text-gray-300">Custom Checkers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{phpFiles.length}</div>
                <div className="text-sm text-gray-300">PHP Files</div>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Admin Panel Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
