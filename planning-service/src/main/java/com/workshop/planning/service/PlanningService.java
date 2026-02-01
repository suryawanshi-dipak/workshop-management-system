package com.workshop.planning.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.workshop.planning.entity.Planning;
import com.workshop.planning.entity.PlanningLine;
import com.workshop.planning.repository.PlanningRepository;

@Service
public class PlanningService {
    
    private final PlanningRepository planningRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public PlanningService(PlanningRepository planningRepository) {
        this.planningRepository = planningRepository;
    }

    public Planning createPlanning(Planning planning) {
        if (planning.getLines() != null) {
            for (PlanningLine line : planning.getLines()) {
                line.setPlanning(planning);
            }
        }
        planning.setStatus("DRAFT");
        return planningRepository.save(planning);
    }

    public Planning getPlanning(Long id) {
        Planning p = planningRepository.getById(id);
        return p;
    }



}
