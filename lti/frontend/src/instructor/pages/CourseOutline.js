import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, DatePicker, Dropdown, Input, Notification, Title } from '../../design-system';
import CourseInfo from '../components/CourseInfo';
import ChevronDown from '../../assets/chevron-down.svg';
import Menu from '../../assets/menu.svg'
import Arrow from '../../assets/arrow-left.svg';
import DropdownMenu from '../components/DropdownMenu';
import LoadingPage from '../components/LoadingPage.js';
import DeleteModal from '../components/DeleteModal';
import { ToastContainer, toast, Bounce } from 'react-toastify';

const CourseOutline = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)
    const [modules, setModules] = useState([
        {
            id: 1,
            name: '',
            rows: [],
            originalRows: [],
            isOrdering: false,
            allChecked: false,
            checkedRows: [],
            isStartDateOpen: false,
            isEndDateOpen: false,
            isTableVisible: true,
            isEditing: false
        }]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedModuleName, setSelectedModuleName] = useState('')

    const formatTimeStamps = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
        });
    };

    const updateDateOnly = (isoString, newDate) => {
        const originalDate = new Date(isoString);
    
        const parsedNewDate = new Date(newDate);
        if (isNaN(parsedNewDate.getTime())) {
            throw new Error(`Invalid date: ${newDate}`);
        }
    
        originalDate.setFullYear(parsedNewDate.getFullYear());
        originalDate.setMonth(parsedNewDate.getMonth());
        originalDate.setDate(parsedNewDate.getDate());
    
        return originalDate;
    };


    const handleOpenModal = (id, name) => {
        
        setSelectedModule(id);
        setSelectedModuleName(name)
          
        setIsModalOpen(true);
        
    }

    const handleDeleteModule = async (id) => {
        try {
          const formData = new FormData();
          formData.append('module_id', id);
    
          const response = await fetch(`/lti/api/modules/delete_module/`, {
            method: 'POST',
            body: formData
          });
    
          if (response.status === 204) {
            retrieveModules()
            setIsModalOpen(false)
          }
        }
        catch (error) {
          console.error(error);
        }
      }

    const retrieveModules = async () => {
        try {
            const response = await fetch(`/lti/api/modules/get_modules_by_course_id/${COURSE_ID}`);

            const newData = await response.json();


            for (let i=0 ; i < newData.length; i++) {
                const prequizResponse = await fetch(`/lti/api/assignments/get_prequiz/${newData[i].id}`);
                
                if (prequizResponse.ok) {
                    const prequizData = await prequizResponse.json();
                    newData[i].rows.unshift(prequizData);
                }
            }
            
            setData(newData);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        retrieveModules();
    }, []);

    useEffect(() => {
        if (data) {
            setModules(data.map(d => ({
                id: d.id,
                name: d.name,
                rows: d.rows || [],
                prequiz: d.prequiz,
                skills: d.skills,
                isOrdering: false,
                allChecked: false,
                checkedRows: Array((d.rows || []).length).fill(false),
                isStartDateOpen: false,
                isEndDateOpen: false,
                isTableVisible: true,
                isEditing: false
            })));
        }
    }, [data]);


    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');
    const [draggedRowIndex, setDraggedRowIndex] = useState(null);



    const handleDragStart = (moduleId, index) => {
        const module = modules.find(m => m.id === moduleId);
        if (!module.isOrdering) return;

        setDraggedRowIndex({ moduleId, index });
    };

    const handleDragOver = (event, moduleId) => {
        event.preventDefault();
    };

    const handleDrop = (moduleId, index) => {
        if (!draggedRowIndex || draggedRowIndex.moduleId !== moduleId || draggedRowIndex.index === index) return;

        setModules(modules.map(module => {
            if (module.id === moduleId) {
                const updatedRows = [...module.rows];
                const [movedRow] = updatedRows.splice(draggedRowIndex.index, 1);
                updatedRows.splice(index, 0, movedRow);
                return { ...module, rows: updatedRows };
            }
            return module;
        }));

        setDraggedRowIndex(null);
    };

    const handleAddNewModule = () => {
        setIsAddingModule(!isAddingModule);
    };

    const handleSaveNewModule = async () => {
        setIsAddingModule(false);

        try {
            const response = await fetch('/lti/api/modules/create_module/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    course_id: COURSE_ID,
                    name: newModuleName
                })
            });
            if (response.ok) {
                setNewModuleName('')
                retrieveModules(); 
            }
        }
        catch (error) {
            console.error(error);
        }
    };

    const handleModuleNameChange = (e) => {
        setNewModuleName(e.target.value);
    };


    const handleAllChecked = (moduleId) => {
        setModules(modules.map(module => {
            if (module.id === moduleId) {
                const allChecked = !module.allChecked;
                return {
                    ...module,
                    allChecked,
                    checkedRows: Array(module.rows.length).fill(allChecked)
                };
            }
            return module;
        }));
    };

    const handleRowChecked = (moduleId, index) => {
        setModules(modules.map(module => {
            if (module.id === moduleId) {
                const updatedCheckedRows = [...module.checkedRows];
                updatedCheckedRows[index] = !updatedCheckedRows[index];
                return {
                    ...module,
                    checkedRows: updatedCheckedRows,
                    allChecked: updatedCheckedRows.every(Boolean)
                };
            }
            return module;
        }));
    };

    const handleOrdering = async (moduleId, isCancel = false, isSaving = false) => {

        if (isSaving) {
            const moduleToUpdate = modules.find(module => module.id === moduleId);
            if (!moduleToUpdate) return;
            await fetch(`/lti/api/modules/update_assignment_order/${moduleId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    assignment_ids: moduleToUpdate.rows.map(row => row.id)
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to save module order');
                    }
                })
                .catch(error => {
                    console.error('Error saving module order:', error);
                });
        }

        setModules(modules.map(module => {
            if (module.id === moduleId) {
                if (!module.isOrdering) {
                    return { ...module, originalRows: [...module.rows], isOrdering: true };
                }
                if (isCancel) {
                    return { ...module, rows: module.originalRows, isOrdering: false };
                }
                return { ...module, isOrdering: false };
            }
            return module;
        }));


    };


    const toggleTableVisibility = (moduleId) => {
        setModules(modules.map(module =>
            module.id === moduleId ? { ...module, isTableVisible: !module.isTableVisible } : module
        ));
    };

    const handleStartDate = (moduleId) => {
        setModules(modules.map(module =>
            module.id === moduleId ? { ...module, isStartDateOpen: !module.isStartDateOpen } : module
        ));
    };

    const handleEndDate = (moduleId) => {
        setModules(modules.map(module =>
            module.id === moduleId ? { ...module, isEndDateOpen: !module.isEndDateOpen } : module
        ));
    };

    const handleSetStart = async (moduleId, newDate) => {
        const targetModule = modules.find(module => module.id === moduleId);
        const checkedAssignments = targetModule.rows.filter((_, index) => targetModule.checkedRows[index]);
        try {
            const responses = await Promise.all(
                checkedAssignments.map(async (assignment) => {
                    const updatedISODate = updateDateOnly(assignment.start_date, newDate);
                    const response = await fetch(`/lti/api/assignments/edit_assignment/${assignment.id}/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            'start_date': updatedISODate.toISOString().slice(0, 16)
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update assignment ${assignmentId}`);
                    }

                    return response.json();
                })
            );


            handleStartDate(moduleId);
            retrieveModules();
        } catch (error) {
            console.error("Error updating assignments:", error);
        }


    }

    const handleSetEnd = async (moduleId, newDate) => {
        const targetModule = modules.find(module => module.id === moduleId);
        const checkedAssignments = targetModule.rows.filter((_, index) => targetModule.checkedRows[index]);
        try {
            const responses = await Promise.all(
                checkedAssignments.map(async (assignment) => {
                    const updatedISODate = updateDateOnly(assignment.start_date, newDate);

                    const response = await fetch(`/lti/api/assignments/edit_assignment/${assignment.id}/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            'end_date': updatedISODate.toISOString().slice(0, 16)
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update assignment ${assignmentId}`);
                    }

                    return response.json();
                })
            );


            handleStartDate(moduleId);
            retrieveModules();
        } catch (error) {
            console.error("Error updating assignments:", error);
        }
    }

    const handleEditClick = (moduleId) => {
        setModules(modules.map(module =>
            module.id === moduleId ? { ...module, isEditing: !module.isEditing } : module
        ));
    };

    const handleInputChange = (moduleId, event) => {
        const newValue = event.target.value;
        setModules(modules.map(module =>
            module.id === moduleId ? { ...module, editedName: newValue } : module
        ));
    };

    const handleSaveName = (moduleId) => {
        setModules(modules.map(module =>
            module.id === moduleId ? { ...module, name: module.editedName, isEditing: false } : module
        ));
    };

    const handleDeleteAssignment = async (assignmentId, module) => {
        if (assignmentId === module.prequiz.id && module.rows.length > 1) {
            toast.error("You cannot delete this prequiz as you have other assignments")
            return;
        }
        try {
            const formData = new FormData();
            formData.append('assignment_id', assignmentId);

            const response = await fetch(`/lti/api/assignments/delete_assignment/`, {
                method: 'POST',
                body: formData
            });

            if (response.status === 204) {
                retrieveModules()
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    const handleEditAssignment = (assignmentId) => {
        navigate(`/lti/edit_assignment/${assignmentId}`);
    };

    const handleAddQuestion = (assignmentId) => {
        console.log("This is the assignment id");
        console.log(assignmentId);
        navigate(`/lti/add_questions/${assignmentId}`);
    };

    const handleSort = (moduleId, type) => {

        setModules(modules.map(module => {
            if (module.id === moduleId) {
                let sortedRows = [...module.rows];
                if (type === 'alphabetically') {
                    sortedRows.sort((a, b) => a.topic.localeCompare(b.topic));
                    console.log(sortedRows)
                } else if (type === 'dueDate') {
                    sortedRows.sort((a, b) => new Date(a.end) - new Date(b.end));
                }
                return { ...module, rows: sortedRows };
            }
            return module;
        }));
    };

    const renderModuleName = (module) => {
        if (module.isEditing) {
            return <section className='flex items-center gap-6'>
                <Input
                    value={module.editedName}
                    label=''
                    onChange={(e) => handleInputChange(module.id, e)}
                    width='w-40'
                />
                <span className='mb-4 flex gap-4'>
                    <Button label='Save' onClick={() => handleSaveName(module.id)} />
                    <Button label='Cancel' onClick={() => handleEditClick(module.id)} type='outline' />
                </span>
            </section>
        }
        return <h3
            className='text-slate-900 text-lg font-medium cursor-pointer'
            onClick={() => handleEditClick(module.id)}
        >
            {module.name}
        </h3>

    };

    const renderMenu = (module) => {
        console.log(module.prequiz)
        if (module.isOrdering) {
            return (
                <section className='flex justify-between items-center mt-8 mx-16'>
                    <section className='flex items-center gap-4'>
                        <button
                            onClick={() => toggleTableVisibility(module.id)}
                            className={` transform transition-transform ${module.isTableVisible ? '' : 'rotate-[180deg]'
                                }`}
                        >
                            <ChevronDown />
                        </button>
                        {renderModuleName(module)}
                    </section>
                    <section className='flex gap-4'>
                        <Button label='Save' onClick={() => handleOrdering(module.id, false, true)} />
                        <Button label='Cancel' onClick={() => handleOrdering(module.id, true)} type='outline' />
                        <Dropdown label='' width='w-44' placeholder='Options' margin={false} options={[
                            { label: 'Alphabetically', onClick: () => handleSort(module.id, 'alphabetically') },
                            { label: 'By Due Date', onClick: () => handleSort(module.id, 'dueDate') },
                            { label: 'Cancel', onClick: () => handleSort(module.id, 'cancel') }
                        ]} />
                    </section>
                </section>
            )
        }

        if (module.checkedRows.includes(true)) {
            return (
                <section className='flex justify-between items-center mt-8 mx-16'>
                    <section className='flex items-center gap-4'>
                        <button
                            onClick={() => toggleTableVisibility(module.id)}
                            className={` transform transition-transform ${module.isTableVisible ? '' : 'rotate-[180deg]'
                                }`}
                        >
                            <ChevronDown />
                        </button>
                        <Checkbox label='' checked={module.allChecked} onChange={() => handleAllChecked(module.id)} />
                        {renderModuleName(module)}
                    </section>
                    <section className='flex gap-4'>
                        <Button label='Edit Start Date' type='outline' onClick={() => handleStartDate(module.id)} />
                        <Button label='Edit End Date' type='outline' onClick={() => handleEndDate(module.id)} />
                    </section>

                    <DatePicker position='bottom-1 right-12' isCalendarOpen={module.isStartDateOpen} handleCalendarOpen={() => handleStartDate(module.id)} onDateChange={(date) => handleSetStart(module.id, date)} />
                    <DatePicker position='bottom-1 right-12' isCalendarOpen={module.isEndDateOpen} handleCalendarOpen={() => handleEndDate(module.id)} onDateChange={(date) => handleSetEnd(module.id, date)} />
                </section>
            )
        }
        return (
            <section className='flex justify-between items-center mt-8 mx-16'>
                <section className='flex items-center gap-4'>
                    <button
                        onClick={() => toggleTableVisibility(module.id)}
                        className={` transform transition-transform ${module.isTableVisible ? '' : 'rotate-[180deg]'
                            }`}
                    >
                        <ChevronDown />
                    </button>
                    <Checkbox label='' checked={module.allChecked} onChange={() => handleAllChecked(module.id)} />
                    {renderModuleName(module)}
                </section>
                <section className='flex gap-4'>
                    {(module.skills && !module.prequiz) && <Button label='Add Prequiz to Module' onClick={() => navigate(`/lti/create_prequiz/${module.id}`)} />}
                    {module.prequiz && module.prequiz.is_valid && <Button label='Add Assignment to Module' onClick={() => navigate(`/lti/create_assignment/${module.id}`)} />}
                    <Button label='Add Objectives to Module' onClick={() => navigate('/lti/select_objectives/')} />
                    <Button label='Edit Order' onClick={() => handleOrdering(module.id)} type='outline' />
                    <Button label='Delete Module' onClick={() => handleOpenModal(module.id, module.name)} />
                </section>
            </section>
        )
    }

    if (loading) {
        return (<LoadingPage />)
    }


    return (
        <main className='flex flex-col gap-4'>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" transition={Bounce}
      />
            <header className='p-6 pl-10 flex items-center justify-between'>
                <article className='flex flex-col gap-2'>
                    <span className='flex flex-row gap-2'>
                        <button onClick={() => navigate('/lti/landing_page/')}>
                            <Arrow className='mt-1 mr-2' />
                        </button>
                        <Title>{COURSE_NAME}</Title>
                    </span>
                    <CourseInfo />
                </article>
                <div className="flex items-center gap-4">
                    <Button type='lightGreenOutline' label='Manage Textbooks' onClick={() => navigate('/lti/manage_textbooks')}/>
                    <Button type='lightGreenOutline' label='Settings' onClick={() => navigate('/lti/course_settings')} />
                </div>
            </header>
            <section className='bg-[#f8f8f8] min-h-screen pb-6'>
                <section className='flex gap-6 items-center mt-4 mx-16'>
                    <h2 className={`text-slate-900 text-xl font-medium ${isAddingModule ? 'mb-4' : ''}`}>Course Outline</h2>
                    {!isAddingModule ? (
                        <Button label='Add New Module' onClick={handleAddNewModule} />
                    ) : (
                        <section className="flex items-center gap-4">
                            <Input
                                type='text'
                                placeholder='Enter module name'
                                label=''
                                value={newModuleName}
                                onChange={handleModuleNameChange}
                            />
                            <span className='mb-4 flex gap-4'>
                                <Button label='Save' onClick={handleSaveNewModule} />
                                <Button label='Cancel' onClick={handleAddNewModule} type='outline' />
                            </span>
                        </section>
                    )}
                </section>
                {modules.map(module => (
                    <section key={module.id}>
                        {renderMenu(module)}
                        {!module.skills && <div className='mt-6 mx-16'><Notification type={'error'} message={'Please add an objective to this module before adding assignments'} /></div>}
                        {(module.skills && !module.prequiz) && <div className='mt-6 mx-16'><Notification type={'error'} message={'Please add a prequiz to this module before adding assignments'} /></div>}
                        {module.prequiz && !module.prequiz.is_valid && <div className='mt-6 mx-16'><Notification type={'error'} message={`Your prequiz does not cover all the objectives in this module. Missing objectives: ${module.prequiz.missing_skills.map(skill => skill.name).join(', ')}`} /></div>}
                        {module.isTableVisible &&
                            <section className='bg-white rounded-xl border border-slate-300 mt-6 mx-16'>
                                {module.rows.length > 0 ? <table className='w-full'>
                                    {module.rows.map((row, i) => (
                                        <tr
                                            key={i}
                                            className={`last:border-none border-b border-slate-300 cursor-${module.isOrdering ? 'move' : 'default'}`}
                                            draggable={module.isOrdering}
                                            onDragStart={() => handleDragStart(module.id, i)}
                                            onDragOver={(event) => handleDragOver(event, module.id)}
                                            onDrop={() => handleDrop(module.id, i)}
                                        >
                                            <td className='w-5 p-4'>
                                                {module.isOrdering ? <Menu /> : <Checkbox label='' checked={module.checkedRows[i]} onChange={() => handleRowChecked(module.id, i)} />}
                                            </td>
                                            <td className='w-4/5 text-slate-700 text-sm font-medium'>{row.topic}</td>
                                            <td className='w-1/5 pl-8 text-slate-700 text-sm font-medium'>
                                                {formatTimeStamps(row.start)} - {formatTimeStamps(row.end)}
                                            </td>
                                            <td className='pr-6'>
                                                <DropdownMenu editFunction={() => handleEditAssignment(row.id)} deleteFunction={() => handleDeleteAssignment(row.id, module)} addQuestionFunction={() => handleAddQuestion(row.id)} name={row.topic} />
                                            </td>
                                        </tr>
                                    ))}

                                </table> : <p className='h-10 flex justify-center items-center text-slate-700 text-sm font-medium'>No assignment yet</p>}
                            </section>
                        }

                    </section>
                ))}
            </section>
            <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={() => handleDeleteModule(selectedModule)}
        name={selectedModuleName}
        objectType='MODULE'
        modalType='DELETE_ITEM'
      />

        </main>
    );
};

export default CourseOutline;
