/// <reference path="jaml.ts" />

import * as jamlApi from './jaml';

var jam = new jamlApi.Jaml();

jam.register('simple', new jamlApi.Template(function () { 'p("hello")' }));

jam.render('simple');