import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  Autocomplete,
  Card,
  CardContent,
  Avatar,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  Pagination
} from '@mui/material';

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [consultationType, setConsultationType] = useState('all');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [doctorsPerPage] = useState(5);

  useEffect(() => {
    // Fetch doctors data
    const fetchDoctors = async () => {
      try {
        const response = await fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
        const data = await response.json();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, consultationType, selectedSpecialties, sortBy]);

  // Get unique specialties from doctors data
  const specialties = [...new Set(doctors.flatMap(doctor => 
    doctor.specialities.map(spec => spec.name)
  ))];

  // Handle search with suggestions
  const handleSearchChange = (event, value) => {
    setSearchQuery(value || '');
    if (value) {
      const matchingDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matchingDoctors.slice(0, 3).map(doc => doc.name));
    } else {
      setSuggestions([]);
    }
    applyFilters(value, consultationType, selectedSpecialties, sortBy);
  };

  // Handle consultation type change
  const handleConsultationTypeChange = (event) => {
    const type = event.target.value;
    setConsultationType(type);
    applyFilters(searchQuery, type, selectedSpecialties, sortBy);
  };

  // Handle specialty selection
  const handleSpecialtyChange = (event) => {
    const specialty = event.target.name;
    const isChecked = event.target.checked;
    const updatedSpecialties = isChecked
      ? [...selectedSpecialties, specialty]
      : selectedSpecialties.filter(spec => spec !== specialty);
    setSelectedSpecialties(updatedSpecialties);
    applyFilters(searchQuery, consultationType, updatedSpecialties, sortBy);
  };

  // Handle sorting
  const handleSortChange = (event) => {
    const sortValue = event.target.value;
    setSortBy(sortValue);
    applyFilters(searchQuery, consultationType, selectedSpecialties, sortValue);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Apply all filters
  const applyFilters = (search, consult, specialties, sort) => {
    let filtered = [...doctors];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply consultation type filter
    if (consult !== 'all') {
      filtered = filtered.filter(doctor =>
        consult === 'video' ? doctor.video_consult : doctor.in_clinic
      );
    }

    // Apply specialty filter
    if (specialties.length > 0) {
      filtered = filtered.filter(doctor =>
        doctor.specialities.some(spec => specialties.includes(spec.name))
      );
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        if (sort === 'fees') {
          return parseInt(a.fees.replace(/[^0-9]/g, '')) - parseInt(b.fees.replace(/[^0-9]/g, ''));
        } else if (sort === 'experience') {
          return parseInt(b.experience) - parseInt(a.experience);
        }
        return 0;
      });
    }

    setFilteredDoctors(filtered);
  };

  // Get current page doctors
  const indexOfLastDoctor = page * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Filters */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            {/* Consultation Type Filter */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" data-testid="filter-header-moc">
                Consultation Mode
              </FormLabel>
              <RadioGroup value={consultationType} onChange={handleConsultationTypeChange}>
                <FormControlLabel
                  value="video"
                  control={<Radio data-testid="filter-video-consult" />}
                  label="Video Consult"
                />
                <FormControlLabel
                  value="clinic"
                  control={<Radio data-testid="filter-in-clinic" />}
                  label="In Clinic"
                />
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label="All"
                />
              </RadioGroup>
            </FormControl>

            {/* Specialties Filter */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" data-testid="filter-header-speciality">
                Specialties
              </FormLabel>
              <FormGroup>
                {specialties.map((specialty) => (
                  <FormControlLabel
                    key={specialty}
                    control={
                      <Checkbox
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={handleSpecialtyChange}
                        name={specialty}
                        data-testid={`filter-specialty-${specialty.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      />
                    }
                    label={specialty}
                  />
                ))}
              </FormGroup>
            </FormControl>

            {/* Sort Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel component="legend" data-testid="filter-header-sort">
                Sort By
              </FormLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                displayEmpty
                sx={{ mt: 1 }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="fees" data-testid="sort-fees">Fees (Low to High)</MenuItem>
                <MenuItem value="experience" data-testid="sort-experience">Experience (High to Low)</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Main Content - Doctor List */}
        <Grid item xs={12} md={9}>
          {/* Search Bar */}
          <Autocomplete
            freeSolo
            options={suggestions}
            value={searchQuery}
            onChange={handleSearchChange}
            onInputChange={handleSearchChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Search doctors"
                variant="outlined"
                margin="normal"
                data-testid="autocomplete-input"
              />
            )}
            ListboxProps={{
              'data-testid': 'suggestion-item'
            }}
          />

          {/* Doctor Cards */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {currentDoctors.map((doctor) => (
              <Grid item xs={12} key={doctor.id}>
                <Card data-testid="doctor-card">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item>
                        <Avatar
                          src={doctor.photo}
                          alt={doctor.name}
                          sx={{ width: 100, height: 100 }}
                        />
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h6" data-testid="doctor-name">
                          {doctor.name}
                        </Typography>
                        <Typography color="textSecondary" data-testid="doctor-specialty">
                          {doctor.specialities.map(spec => spec.name).join(', ')}
                        </Typography>
                        <Typography color="textSecondary" data-testid="doctor-experience">
                          {doctor.experience}
                        </Typography>
                        <Typography color="primary" data-testid="doctor-fee">
                          {doctor.fees}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {doctor.video_consult && (
                            <Chip label="Video Consult" color="primary" sx={{ mr: 1 }} />
                          )}
                          {doctor.in_clinic && (
                            <Chip label="In Clinic" color="secondary" />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                data-testid="pagination"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorListing; 