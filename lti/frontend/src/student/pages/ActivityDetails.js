import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import XClose from '../../assets/x-close.svg';
import Check from '../../assets/check.svg';
import Arrow from '../../assets/arrow-left.svg';
import { SearchBar, SquareButton, Title } from '../../design-system';
import ResultItem from '../components/ResultItem';
import LoadingPage from '../../instructor/components/LoadingPage';


const ActivityDetails = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentAttempt, setAssignmentAttempt] = useState(null);
  const navigate = useNavigate();

  const { assignmentId } = useParams();
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const formatToNewYorkTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchQuestionAttempts = async () => {
      const response = await fetch(`/lti/api/questions/retrieve_question_attempts/${assignmentId}?user_id=${USER_ID}`, { method: 'GET' })
      const responseData = await response.json()
      console.log(responseData)
      setAssignmentAttempt(responseData)
    }
    fetchQuestionAttempts()
  }, [assignmentId])

  useEffect(() => {
    const formattedData = assignmentAttempt 
      ? assignmentAttempt.map((item) => ({
          type: 'text',
          status: item.associated_possible_answer?.is_correct ? 'correct' : 'incorrect',
          text: item.associated_question?.text,
          time: formatToNewYorkTime(item.created_at)          
        }))
      : [];
    setData(formattedData);
    setLoading(false);
  }, [assignmentAttempt]);

  const counts = {
    All: data.length,
    Correct: data.filter((item) => item.status === 'correct').length,
    Incorrect: data.filter((item) => item.status === 'incorrect').length,
  }

  const filteredData = data
    .filter((item) =>
      activeFilter === "All" ||
      (activeFilter === "Correct" && item.status === "correct") ||
      (activeFilter === "Incorrect" && item.status === "incorrect")
    )
    .filter((item) => item.text.toLowerCase().includes(searchQuery));

  const filters = [
    { label: 'All', icon: null },
    { label: 'Correct', icon: <Check className='h-5 w-5 mr-2' /> },
    { label: 'Incorrect', icon: <XClose className='h-5 w-5 mr-2' /> },
  ]

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <main>
      <header className='h-40 p-6 pl-10 flex flex-col gap-2'>
      <section className='flex gap-2 items-center'>
      <button onClick={() => navigate(-1)}>
        <Arrow />
      </button>
        <Title>Activity Details</Title>
      </section>
      </header>

      <section className='bg-[#f8f8f8] p-6 h-screen'>
        <section className='mx-8 p-8 bg-white rounded-xl border border-slate-300'>
          <SearchBar onChange={handleSearch}/>
          <nav className='flex mb-4'>
            {filters.map((filter, index) => (
              <SquareButton
                key={index}
                label={`${filter.label} (${counts[filter.label]})`}
                isActive={activeFilter === filter.label}
                onClick={() => setActiveFilter(filter.label)}
                icon={filter.icon}
                noBorder={index == 0 || index === 1}
              />
            ))}
          </nav>
          <section>
            {filteredData.map((item, index) => (
              <ResultItem
                key={index}
                type={item.type}
                status={item.status}
                text={item.text}
                time={item.time}
              />
            ))}
          </section>
        </section>
      </section>

    </main>
  );
};

export default ActivityDetails;
