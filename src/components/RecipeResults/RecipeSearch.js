import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AdvancedSearch from './AdvancedSearch';
import SearchResults from './SearchResults';
import { Box, Paper, Divider, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';
import { fetchComplexRecipes, fetchMoreComplexRecipes, clearComplexSearchResults } from '../../store';


const RecipeSearch = () => {
  const theme = useTheme()
  const recipes = useSelector(state => state.complexRecipes)
  const [showLoadMore, setLoadMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [value, setValue] = useState([]);
  const [cuisine, setCuisine] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [diet, setDiet] = useState('');
  const [meal, setMeal] = useState('');
  const [number, setNumber] = useState(12);
  const [intolerances, setIntolerances] = useState([])
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();

  useEffect(()=> {window.scrollTo(0,0)},[])

  const handleComplexSearch = async(e) => {
    await dispatch(clearComplexSearchResults())
    setLoading(true)
    const options = {
      query: searchValue,
      cuisine,
      type: meal,
      diet,
      excludeIngredients: value.join(','),
      intolerances: intolerances.join(','),
      offset: 0,
      number: number
    }
    await dispatch(fetchComplexRecipes(options))
    setLoading(false)
    setLoadMore(true)
  }

  const handleLoadMoreComplex = async(e) => {
    setLoading(true)
    const options = {
      query: searchValue,
      cuisine,
      type: meal,
      diet,
      intolerances: value.join(','),
      offset: recipes.length +1,
      number: number
    }
    await dispatch(fetchMoreComplexRecipes(options))
    setLoading(false)
  }

  const handleCuisine = e => {
    setCuisine(e.target.value)
  }

  const handleDiet = e => {
    setDiet(e.target.value)
  };

  const handleMeal = e => {
    setMeal(e.target.value)
  }

  const handleComplexSearchChange = e => {
    setSearchValue(e.target.value)
  }

  const handleNumChange = (e) => {
    setNumber(e.target.value);
  };
  
  return(
    <Box 
      className='top-level-page'
      sx={{
      width:'100vh%',
      height:'100%',
      minHeight:'100vh',
      backgroundImage:'url("/images/Background14.jpg")',
      backgroundSize:'cover',
      backgroundAttachment:'fixed',
      display:'flex',
      justifyContent:'center'
    }}>
      <Paper
      sx={{
        padding: '40px 0 40px 0',
        margin: '40px 0 40px 0',
        opacity:'.9', 
        display:'flex', 
        justifyContent:'center', 
        flexDirection:'column',
        alignItems:'center',
        width:'80vw',
        height: recipes.length ? 'auto' : '100%',
        backgroundColor:`${theme.palette.background.paper}`}}
        >
        <Box sx={{color:'gray', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}} >
          <Typography variant='h5' sx={{marginBottom:'.5em'}}>Search for Recipes</Typography>
          <Typography variant='textSecondary' sx={{marginBottom:'.5em'}}>Refine your search with the options below</Typography>
        </Box>
        <Divider sx={{width:'100%'}}/>
        <Box sx={{display:'flex', width:'100%', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', }}>
          <AdvancedSearch 
            handleComplexSearch={handleComplexSearch} 
            searchValue={searchValue} 
            value={value} 
            number={number}
            setValue={setValue} 
            handleCuisine={handleCuisine}
            handleDiet={handleDiet}
            handleMeal={handleMeal}
            handleComplexSearchChange={handleComplexSearchChange}
            handleNumChange={handleNumChange}
            intolerances={intolerances}
            setIntolerances={setIntolerances}
            />
          <SearchResults loading={loading} showLoadMore={showLoadMore} setOffset={setOffset} handleLoadMoreComplex={handleLoadMoreComplex}/>
        </Box>
      </Paper>
    </Box>
  )
};

export default RecipeSearch;