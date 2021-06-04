# Class Roadmap

## Members

<dl>
<dt><a href="#startTime">startTime</a></dt>
<dd><p>get the starting time of the roadmap</p>
</dd>
<dt><a href="#endTime">endTime</a></dt>
<dd><p>get the ending time of the roadmap</p>
</dd>
<dt><a href="#startTime">startTime</a></dt>
<dd><p>set the starting time of the roadmap</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#setTimeScales">setTimeScales(_scales)</a></dt>
<dd><p>set the time scales</p>
</dd>
<dt><a href="#restoreTimeScales">restoreTimeScales()</a></dt>
<dd><p>restore the default time scales which defined in the template</p>
</dd>
<dt><a href="#setTimeScalesDisplay">setTimeScalesDisplay(_layout)</a></dt>
<dd><p>set the displaying text of the time scales</p>
</dd>
<dt><a href="#restoreTimeScalesDisplay">restoreTimeScalesDisplay()</a></dt>
<dd><p>restore the default displaying text of the time scales defined in the template</p>
</dd>
<dt><a href="#clear">clear()</a></dt>
<dd><p>clear the content of the roadmap</p>
</dd>
<dt><a href="#showProject">showProject(..._projects)</a> : <code>undefined</code> | <code>Array.&lt;Object&gt;</code></dt>
<dd><p>show the projects in the roadmap</p>
</dd>
<dt><a href="#showProjects">showProjects(_projects)</a> : <code>undefined</code> | <code>Array.&lt;Object&gt;</code></dt>
<dd><p>show the projects in the roadmap</p>
</dd>
<dt><a href="#showSample">showSample()</a> : <code>undefined</code> | <code>Array.&lt;Object&gt;</code></dt>
<dd><p>show the sample project in the roadmap</p>
</dd>
<dt><a href="#toImage">toImage()</a> : <code>Promise.&lt;Image&gt;</code></dt>
<dd><p>convert the roadmap to an image object</p>
</dd>
<dt><a href="#toImageData">toImageData(_type)</a> : <code>String</code></dt>
<dd><p>convert the roadmap to the data of a image</p>
</dd>
</dl>

<a name="startTime"></a>

## startTime
get the starting time of the roadmap

**Kind**: global variable  
<a name="endTime"></a>

## endTime
get the ending time of the roadmap

**Kind**: global variable  
<a name="startTime"></a>

## startTime
set the starting time of the roadmap

**Kind**: global variable  
<a name="setTimeScales"></a>

## setTimeScales(_scales)
set the time scales

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| _scales | <code>Array</code> | the set of the starting times for each time scale, the last one is the ending time of the roadmap |

<a name="restoreTimeScales"></a>

## restoreTimeScales()
restore the default time scales which defined in the template

**Kind**: global function  
<a name="setTimeScalesDisplay"></a>

## setTimeScalesDisplay(_layout)
set the displaying text of the time scales

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| _layout | <code>Array</code> | the display informations of the time scales.                           They stored as the struct of the layout.                           Each item should be an object, in which has "text" property means the displaying text, and "subGroup" property means the child items in the layout tree |

<a name="restoreTimeScalesDisplay"></a>

## restoreTimeScalesDisplay()
restore the default displaying text of the time scales defined in the template

**Kind**: global function  
<a name="clear"></a>

## clear()
clear the content of the roadmap

**Kind**: global function  
<a name="showProject"></a>

## showProject(..._projects) : <code>undefined</code> \| <code>Array.&lt;Object&gt;</code>
show the projects in the roadmap

**Kind**: global function  
**Returns**: <code>undefined</code> \| <code>Array.&lt;Object&gt;</code> - the set of projects' information which don't show in the roadmap, it often occur in the max-size has been specified in the roadmap  

| Param | Type | Description |
| --- | --- | --- |
| ..._projects | <code>Object</code> | the set of the projects' information |

<a name="showProjects"></a>

## showProjects(_projects) : <code>undefined</code> \| <code>Array.&lt;Object&gt;</code>
show the projects in the roadmap

**Kind**: global function  
**Returns**: <code>undefined</code> \| <code>Array.&lt;Object&gt;</code> - the set of projects' information which don't show in the roadmap, it often occur in the max-size has been specified in the roadmap  

| Param | Type | Description |
| --- | --- | --- |
| _projects | <code>Array.&lt;Object&gt;</code> | the set of the projects' information |

<a name="showSample"></a>

## showSample() : <code>undefined</code> \| <code>Array.&lt;Object&gt;</code>
show the sample project in the roadmap

**Kind**: global function  
**Returns**: <code>undefined</code> \| <code>Array.&lt;Object&gt;</code> - the set of projects' information which don't show in the roadmap, it often occur in the max-size has been specified in the roadmap  
<a name="toImage"></a>

## toImage() : <code>Promise.&lt;Image&gt;</code>
convert the roadmap to an image object

**Kind**: global function  
**Returns**: <code>Promise.&lt;Image&gt;</code> - the image of the roadmap  
<a name="toImageData"></a>

## toImageData(_type) : <code>Promise.&lt;String&gt;</code>
convert the roadmap to the data of a image

**Kind**: global function  
**Returns**: <code>Promise.&lt;String&gt;</code> - the data of the image of the roadmap  

| Param | Type | Description |
| --- | --- | --- |
| _type | <code>String</code> | the type of the image, "png" will be taken as default when ignore this parameter |

