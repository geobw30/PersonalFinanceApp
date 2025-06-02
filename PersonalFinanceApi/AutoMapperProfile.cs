namespace PersonalFinanceApi;

using AutoMapper;
using PersonalFinanceApi.Models;
using PersonalFinanceApi.DTOs; // <-- Update to use DTOs namespace

public class AutoMapperProfile : AutoMapper.Profile
{
    public AutoMapperProfile()
    {
        CreateMap<SavingDto, Saving>();
        // Add other mappings as needed
    }
}
