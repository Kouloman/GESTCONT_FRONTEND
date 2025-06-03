import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import { Search, Filter, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { mockContainerService, mockShippingLineService } from '../../services/mockServices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ContainerList = () => {
  const [containers, setContainers] = useState([]);
  const [shippingLines, setShippingLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({
    status: '',
    shippingLineId: '',
    type: '',
    search: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch from API
        const [containersResponse, shippingLinesResponse] = await Promise.all([
          api.get('/containers'),
          api.get('/shipping-lines')
        ]);
        
        setContainers(containersResponse.data.containers || containersResponse.data);
        setShippingLines(shippingLinesResponse.data);
      } catch (error) {
        // Fallback to mock data in development
        if (import.meta.env.DEV) {
          try {
            const [mockContainers, mockShippingLines] = await Promise.all([
              mockContainerService.getAll(),
              mockShippingLineService.getAll()
            ]);
            
            setContainers(mockContainers.containers);
            setShippingLines(mockShippingLines);
          } catch (mockError) {
            toast.error("Erreur lors du chargement des données");
          }
        } else {
          toast.error("Erreur lors du chargement des données");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchFilteredContainers = async () => {
    setLoading(true);
    
    try {
      // Try API first
      try {
        const response = await api.get('/containers', { params: filterValues });
        setContainers(response.data.containers || response.data);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV) {
          const mockContainers = await mockContainerService.getAll(filterValues);
          setContainers(mockContainers.containers);
        } else {
          throw error;
        }
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des conteneurs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setFilterValues(prev => ({ ...prev, search: e.target.value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchFilteredContainers();
  };

  const handleResetFilters = () => {
    setFilterValues({
      status: '',
      shippingLineId: '',
      type: '',
      search: '',
    });
    
    // Reset and refetch
    setTimeout(fetchFilteredContainers, 0);
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Numéro',
        accessor: 'containerNumber',
        Cell: ({ value }) => <span className="font-medium">{value}</span>,
      },
      {
        Header: 'Armateur',
        accessor: 'shippingLineName',
      },
      {
        Header: 'Type',
        accessor: 'type',
        Cell: ({ value }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'DRY' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
          }`}>
            {value}
          </span>
        ),
      },
      {
        Header: 'ISO',
        accessor: 'isoCode',
      },
      {
        Header: 'Statut',
        accessor: 'status',
        Cell: ({ value }) => {
          let color = '';
          let text = '';
          
          switch (value) {
            case 'IN_PARK':
              color = 'bg-green-100 text-green-800';
              text = 'Dans le parc';
              break;
            case 'OUT':
              color = 'bg-blue-100 text-blue-800';
              text = 'Sorti';
              break;
            case 'BOOKED':
              color = 'bg-yellow-100 text-yellow-800';
              text = 'Réservé';
              break;
            default:
              color = 'bg-gray-100 text-gray-800';
              text = value;
          }
          
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
              {text}
            </span>
          );
        },
      },
      {
        Header: 'Date d\'entrée',
        accessor: 'entryDate',
        Cell: ({ value }) => new Date(value).toLocaleDateString('fr-FR'),
      },
      {
        Header: 'Date de sortie',
        accessor: 'exitDate',
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString('fr-FR') : '-',
      },
      {
        Header: 'Client',
        accessor: 'client',
        Cell: ({ value }) => value || '-',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
  } = useTable(
    {
      columns,
      data: containers,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { pageIndex, pageSize, globalFilter } = state;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Liste des conteneurs</h1>
        <p className="text-gray-600">Visualisez et gérez tous les conteneurs dans le système</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <Filter size={18} className="mr-2" />
              Filtres
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <RefreshCw size={14} className="mr-1" />
              Réinitialiser
            </button>
          </div>
          
          <form onSubmit={handleApplyFilters}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="form-label">Statut</label>
                <select
                  id="status"
                  name="status"
                  value={filterValues.status}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Tous</option>
                  <option value="IN_PARK">Dans le parc</option>
                  <option value="OUT">Sortis</option>
                  <option value="BOOKED">Réservés</option>
                </select>
              </div>
              
              {/* Shipping Line Filter */}
              <div>
                <label htmlFor="shippingLineId" className="form-label">Armateur</label>
                <select
                  id="shippingLineId"
                  name="shippingLineId"
                  value={filterValues.shippingLineId}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Tous</option>
                  {shippingLines.map(sl => (
                    <option key={sl.id} value={sl.id}>{sl.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Type Filter */}
              <div>
                <label htmlFor="type" className="form-label">Type</label>
                <select
                  id="type"
                  name="type"
                  value={filterValues.type}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Tous</option>
                  <option value="DRY">DRY</option>
                  <option value="REEFER">REEFER</option>
                </select>
              </div>
              
              {/* Search */}
              <div>
                <label htmlFor="search" className="form-label">Recherche</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Numéro de conteneur..."
                    value={filterValues.search}
                    onChange={handleSearchChange}
                    className="form-input pl-9"
                  />
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Appliquer les filtres
              </button>
            </div>
          </form>
        </div>
        
        {/* Table */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            {column.render('Header')}
                            <span>
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <ChevronDown size={14} className="ml-1" />
                                ) : (
                                  <ChevronUp size={14} className="ml-1" />
                                )
                              ) : (
                                ''
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                  {page.map(row => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} className="hover:bg-gray-50">
                        {row.cells.map(cell => (
                          <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex items-center">
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                  }}
                  className="form-select text-sm mr-2"
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize} par page
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{pageIndex + 1}</span> sur{' '}
                  <span className="font-medium">{pageOptions.length}</span>
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className={`btn ${
                    canPreviousPage ? 'btn-outline' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Précédent
                </button>
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className={`btn ${
                    canNextPage ? 'btn-outline' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContainerList;