import { TestBed } from '@angular/core/testing';

import { Tokens } from './tokens';

describe('Tokens', () => {
  let service: Tokens;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tokens);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
